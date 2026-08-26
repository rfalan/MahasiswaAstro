package main

import (
	"api-mahasiswa/config"
	"api-mahasiswa/middleware"
	"api-mahasiswa/models"
	"api-mahasiswa/routes"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	_ "api-mahasiswa/docs"
)

// @title API Mahasiswa
// @version 1.0
// @description REST API untuk mengelola data mahasiswa
// @host localhost:8080
// @BasePath /
func main() {

	// Koneksi PostgreSQL
	config.ConnectDatabase()

	// Membuat tabel mahasiswa
	err := config.DB.AutoMigrate(&models.Mahasiswa{}, &models.User{}, &models.Magang{})
	if err != nil {
		panic("Gagal membuat tabel mahasiswa")
	}

	var totalMahasiswa int64
	config.DB.Model(&models.Mahasiswa{}).Count(&totalMahasiswa)
	if totalMahasiswa == 0 {
		config.DB.Create([]models.Mahasiswa{
			{Nama: "Alya Putri", NIM: "20240001", Jurusan: "Teknik Informatika"},
			{Nama: "Bima Pratama", NIM: "20240002", Jurusan: "Sistem Informasi"},
			{Nama: "Citra Lestari", NIM: "20240003", Jurusan: "Manajemen"},
			{Nama: "Daffa Ramadhan", NIM: "20240004", Jurusan: "Teknik Informatika"},
			{Nama: "Nadia Maharani", NIM: "20240005", Jurusan: "Akuntansi"},
		})
	}

	var totalUsers int64
	config.DB.Model(&models.User{}).Count(&totalUsers)
	if totalUsers == 0 {
		passwordHash, hashErr := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if hashErr != nil {
			panic("Gagal membuat akun admin")
		}
		config.DB.Create(&models.User{
			Nama:         "Admin Dosen",
			Email:        "admin@kampus.local",
			PasswordHash: string(passwordHash),
			Role:         "admin",
		})
	}
	var studentUsers []models.User
	config.DB.Where("role = ? AND mahasiswa_id IS NOT NULL AND (nim = '' OR nim IS NULL)", "mahasiswa").Find(&studentUsers)
	for _, user := range studentUsers {
		var mahasiswa models.Mahasiswa
		if config.DB.First(&mahasiswa, *user.MahasiswaID).Error == nil {
			config.DB.Model(&user).Update("nim", mahasiswa.NIM)
		}
	}

	// Router
	router := gin.Default()

	// Izinkan frontend Astro mengakses API saat development.
	router.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if origin == "http://localhost:4321" || origin == "http://localhost:4322" || origin == "http://127.0.0.1:4321" || origin == "http://127.0.0.1:4322" {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Middleware
	router.Use(middleware.LoggerMiddleware())
	router.Static("/uploads", "./uploads")

	// Routes
	routes.SetupRoutes(router)

	// Jalankan server
	router.Run(":8080")
}
