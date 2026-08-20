package main

import (
	"api-mahasiswa/config"
	"api-mahasiswa/middleware"
	"api-mahasiswa/models"
	"api-mahasiswa/routes"

	"github.com/gin-gonic/gin"

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
	err := config.DB.AutoMigrate(&models.Mahasiswa{})
	if err != nil {
		panic("Gagal membuat tabel mahasiswa")
	}

	// Router
	router := gin.Default()

	// Middleware
	router.Use(middleware.LoggerMiddleware())

	// Routes
	routes.SetupRoutes(router)

	// Jalankan server
	router.Run(":8080")
}
