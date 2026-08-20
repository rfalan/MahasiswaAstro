package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"api-mahasiswa/config"
	"api-mahasiswa/models"
)

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
