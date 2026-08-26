package controllers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"api-mahasiswa/config"
	"api-mahasiswa/models"
)

func Register(c *gin.Context) {
	var input struct {
		Nama            string `json:"nama" binding:"required"`
		Email           string `json:"email" binding:"required,email"`
		Password        string `json:"password" binding:"required,min=6"`
		ConfirmPassword string `json:"confirm_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nama, email, dan password minimal 6 karakter wajib diisi"})
		return
	}
	if input.Password != input.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Konfirmasi password tidak sama"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(input.Email))
	var existing models.User
	if err := config.DB.Where("email = ?", email).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email sudah terdaftar"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengamankan password"})
		return
	}
	user := models.User{Nama: strings.TrimSpace(input.Nama), Email: email, PasswordHash: string(hash), Role: "admin"}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat akun"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registrasi berhasil, silakan login"})
}

func RegisterMahasiswa(c *gin.Context) {
	var input struct {
		NIM             string `json:"nim" binding:"required"`
		Email           string `json:"email" binding:"required,email"`
		Password        string `json:"password" binding:"required,min=6"`
		ConfirmPassword string `json:"confirm_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Password != input.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "NIM, email, password minimal 6 karakter, dan konfirmasi password wajib benar"})
		return
	}

	var mahasiswa models.Mahasiswa
	nim := strings.TrimSpace(input.NIM)
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if err := config.DB.Where("TRIM(nim) = ?", nim).First(&mahasiswa).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "NIM tidak ditemukan. Minta admin menambahkan data mahasiswa terlebih dahulu."})
		return
	}
	var existing models.User
	if err := config.DB.Where("nim = ? OR email = ? OR mahasiswa_id = ?", mahasiswa.NIM, email, mahasiswa.ID).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "NIM atau email sudah memiliki akun"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengamankan password"})
		return
	}
	user := models.User{Nama: mahasiswa.Nama, Email: email, NIM: mahasiswa.NIM, PasswordHash: string(hash), Role: "mahasiswa", MahasiswaID: &mahasiswa.ID}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat akun mahasiswa"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Akun mahasiswa berhasil dibuat, silakan login"})
}

func ResetAdminPassword(c *gin.Context) {
	var input struct {
		Email           string `json:"email" binding:"required,email"`
		Password        string `json:"password" binding:"required,min=6"`
		ConfirmPassword string `json:"confirm_password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || input.Password != input.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, password minimal 6 karakter, dan konfirmasi password wajib benar"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ? AND role = ?", strings.ToLower(strings.TrimSpace(input.Email)), "admin").First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun admin tidak ditemukan"})
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengamankan password baru"})
		return
	}
	if err := config.DB.Model(&user).Update("password_hash", string(hash)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui password admin"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Password admin berhasil direset, silakan login"})
}

func GetMyProfile(c *gin.Context) {
	userID, err := strconv.ParseUint(fmt.Sprintf("%v", c.MustGet("user_id")), 10, 64)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Identitas akun tidak valid"})
		return
	}
	var user models.User
	if err := config.DB.First(&user, uint(userID)).Error; err != nil || user.Role != "mahasiswa" || user.MahasiswaID == nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Profil mahasiswa tidak tersedia"})
		return
	}
	var mahasiswa models.Mahasiswa
	if err := config.DB.First(&mahasiswa, *user.MahasiswaID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data mahasiswa tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"id":      mahasiswa.ID,
		"nama":    mahasiswa.Nama,
		"nim":     mahasiswa.NIM,
		"jurusan": mahasiswa.Jurusan,
		"email":   user.Email,
	})
}

func Login(c *gin.Context) {
	var input struct {
		Credential string `json:"credential" binding:"required"`
		Password   string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "NIM/email dan password wajib diisi"})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ? OR nim = ?", strings.ToLower(strings.TrimSpace(input.Credential)), strings.TrimSpace(input.Credential)).First(&user).Error; err != nil || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "NIM/email atau password salah"})
		return
	}

	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"role":  user.Role,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "mahasiswa-dev-secret-change-this"
	}
	signedToken, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat sesi login"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   signedToken,
		"user": gin.H{
			"id":    user.ID,
			"nama":  user.Nama,
			"email": user.Email,
			"nim":   user.NIM,
			"role":  user.Role,
		},
	})
}
