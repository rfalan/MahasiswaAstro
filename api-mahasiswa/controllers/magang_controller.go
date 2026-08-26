package controllers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"api-mahasiswa/config"
	"api-mahasiswa/models"
)

var validStatuses = map[string]bool{"diajukan": true, "screening": true, "diterima": true, "ditolak": true, "selesai": true}

func ListMagang(c *gin.Context) {
	var applications []models.Magang
	if err := config.DB.Preload("Mahasiswa").Order("created_at DESC").Find(&applications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil proses magang"})
		return
	}
	c.JSON(http.StatusOK, applications)
}

func GetMyMagang(c *gin.Context) {
	userID, err := strconv.ParseUint(fmt.Sprintf("%v", c.MustGet("user_id")), 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identitas akun tidak valid"})
		return
	}
	var user models.User
	if err := config.DB.First(&user, uint(userID)).Error; err != nil || user.MahasiswaID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Profil mahasiswa tidak tersedia"})
		return
	}
	var applications []models.Magang
	config.DB.Where("mahasiswa_id = ?", *user.MahasiswaID).Order("created_at DESC").Find(&applications)
	c.JSON(http.StatusOK, applications)
}

func CreateMyMagang(c *gin.Context) {
	userID, err := strconv.ParseUint(fmt.Sprintf("%v", c.MustGet("user_id")), 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identitas akun tidak valid"})
		return
	}
	var user models.User
	if err := config.DB.First(&user, uint(userID)).Error; err != nil || user.Role != "mahasiswa" || user.MahasiswaID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya akun mahasiswa yang dapat mengajukan magang"})
		return
	}
	var input struct {
		Perusahaan string `json:"perusahaan" binding:"required"`
		Posisi     string `json:"posisi" binding:"required"`
		Catatan    string `json:"catatan"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Perusahaan dan posisi wajib diisi"})
		return
	}
	application := models.Magang{MahasiswaID: *user.MahasiswaID, Perusahaan: input.Perusahaan, Posisi: input.Posisi, Catatan: input.Catatan, Status: "diajukan"}
	if err := config.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengajukan magang"})
		return
	}
	c.JSON(http.StatusCreated, application)
}

func CreateMagang(c *gin.Context) {
	mahasiswaID, err := strconv.ParseUint(c.PostForm("mahasiswa_id"), 10, 64)
	if err != nil || mahasiswaID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Mahasiswa wajib dipilih"})
		return
	}
	status := c.PostForm("status")
	if status == "" {
		status = "diajukan"
	}
	if !validStatuses[status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status proses magang tidak valid"})
		return
	}
	application := models.Magang{MahasiswaID: uint(mahasiswaID), Perusahaan: c.PostForm("perusahaan"), Posisi: c.PostForm("posisi"), Status: status, Catatan: c.PostForm("catatan")}
	if err := saveMagangDocument(c, &application); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan proses magang"})
		return
	}
	config.DB.Preload("Mahasiswa").First(&application, application.ID)
	c.JSON(http.StatusCreated, application)
}

func UpdateMagang(c *gin.Context) {
	var application models.Magang
	if err := config.DB.First(&application, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Proses magang tidak ditemukan"})
		return
	}
	if value := c.PostForm("status"); value != "" {
		if !validStatuses[value] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Status proses magang tidak valid"})
			return
		}
		application.Status = value
	}
	if value := c.PostForm("perusahaan"); value != "" {
		application.Perusahaan = value
	}
	if value := c.PostForm("posisi"); value != "" {
		application.Posisi = value
	}
	if value := c.PostForm("catatan"); value != "" {
		application.Catatan = value
	}
	if err := saveMagangDocument(c, &application); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := config.DB.Save(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui proses magang"})
		return
	}
	config.DB.Preload("Mahasiswa").First(&application, application.ID)
	c.JSON(http.StatusOK, application)
}

func saveMagangDocument(c *gin.Context, application *models.Magang) error {
	file, err := c.FormFile("dokumen")
	if err != nil {
		return nil
	}
	if file.Size > 10*1024*1024 {
		return fmt.Errorf("ukuran dokumen maksimal 10 MB")
	}
	ext := filepath.Ext(file.Filename)
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		return fmt.Errorf("dokumen harus PDF, DOC, atau DOCX")
	}
	if err := os.MkdirAll("uploads/magang", 0755); err != nil {
		return fmt.Errorf("gagal menyiapkan penyimpanan dokumen")
	}
	name := fmt.Sprintf("%d-%d%s", application.MahasiswaID, time.Now().UnixNano(), ext)
	path := filepath.Join("uploads/magang", name)
	if err := c.SaveUploadedFile(file, path); err != nil {
		return fmt.Errorf("gagal menyimpan dokumen")
	}
	application.DokumenURL = "/uploads/magang/" + name
	return nil
}
