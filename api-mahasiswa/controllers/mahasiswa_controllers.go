package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"api-mahasiswa/config"
	"api-mahasiswa/models"
)

func ResetMahasiswaPassword(c *gin.Context) {
	var input struct {
		Password string `json:"password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password baru wajib diisi minimal 6 karakter"})
		return
	}

	var mahasiswa models.Mahasiswa
	if err := config.DB.First(&mahasiswa, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mahasiswa tidak ditemukan"})
		return
	}

	var user models.User
	if err := config.DB.Where("mahasiswa_id = ?", mahasiswa.ID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mahasiswa belum memiliki akun"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengamankan password baru"})
		return
	}
	if err := config.DB.Model(&user).Update("password_hash", string(hash)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui password"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Password mahasiswa berhasil direset"})
}

// GET semua mahasiswa
func GetMahasiswa(c *gin.Context) {

	var mahasiswa []models.Mahasiswa

	if err := config.DB.Find(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal mengambil data mahasiswa",
		})
		return
	}

	c.JSON(http.StatusOK, mahasiswa)
}

// GET mahasiswa berdasarkan ID
func GetMahasiswaByID(c *gin.Context) {

	id := c.Param("id")

	var mahasiswa models.Mahasiswa

	if err := config.DB.First(&mahasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Mahasiswa tidak ditemukan",
		})
		return
	}

	c.JSON(http.StatusOK, mahasiswa)
}

// POST mahasiswa
func CreateMahasiswa(c *gin.Context) {

	var mahasiswa models.Mahasiswa

	if err := c.ShouldBindJSON(&mahasiswa); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data tidak lengkap",
			"error":   err.Error(),
		})
		return
	}

	// Cek apakah NIM sudah digunakan
	var existing models.Mahasiswa

	if err := config.DB.
		Where("nim = ?", mahasiswa.NIM).
		First(&existing).Error; err == nil {

		c.JSON(http.StatusConflict, gin.H{
			"message": "NIM sudah terdaftar",
		})
		return
	}

	if err := config.DB.Create(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal menambahkan mahasiswa",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Data mahasiswa berhasil ditambahkan",
		"data":    mahasiswa,
	})
}

// PUT mahasiswa
func UpdateMahasiswa(c *gin.Context) {

	id := c.Param("id")

	var mahasiswa models.Mahasiswa

	if err := config.DB.First(&mahasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Mahasiswa tidak ditemukan",
		})
		return
	}

	var input struct {
		Nama    string `json:"nama"`
		NIM     string `json:"nim"`
		Jurusan string `json:"jurusan"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Format JSON tidak valid",
		})
		return
	}

	mahasiswa.Nama = input.Nama
	mahasiswa.NIM = input.NIM
	mahasiswa.Jurusan = input.Jurusan

	if err := config.DB.Save(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal memperbarui mahasiswa",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Data mahasiswa berhasil diperbarui",
		"mahasiswa": mahasiswa,
	})
}

// DELETE mahasiswa
func DeleteMahasiswa(c *gin.Context) {

	id := c.Param("id")

	var mahasiswa models.Mahasiswa

	if err := config.DB.First(&mahasiswa, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Mahasiswa tidak ditemukan",
		})
		return
	}

	if err := config.DB.Delete(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Gagal menghapus mahasiswa",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data mahasiswa berhasil dihapus",
	})
}
