package routes

import (
	"github.com/gin-gonic/gin"

	"api-mahasiswa/controllers"
	"api-mahasiswa/middleware"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API berhasil berjalan",
		})
	})
	router.POST("/login", controllers.Login)
	router.POST("/register", controllers.Register)
	router.POST("/register-mahasiswa", controllers.RegisterMahasiswa)
	router.POST("/reset-admin-password", controllers.ResetAdminPassword)

	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware())
	protected.GET("me", controllers.GetMyProfile)
	protected.GET("me/magang", controllers.GetMyMagang)
	student := protected.Group("/")
	student.Use(middleware.RequireRole("mahasiswa"))
	student.POST("me/magang", controllers.CreateMyMagang)

	admin := protected.Group("/")
	admin.Use(middleware.RequireRole("admin"))
	admin.GET("mahasiswa", controllers.GetMahasiswa)

	admin.GET("mahasiswa/:id", controllers.GetMahasiswaByID)

	admin.POST("mahasiswa", controllers.CreateMahasiswa)

	admin.PUT("mahasiswa/:id", controllers.UpdateMahasiswa)
	admin.PUT("mahasiswa/:id/password", controllers.ResetMahasiswaPassword)

	admin.DELETE("mahasiswa/:id", controllers.DeleteMahasiswa)
	admin.GET("magang", controllers.ListMagang)
	admin.POST("magang", controllers.CreateMagang)
	admin.PUT("magang/:id", controllers.UpdateMagang)
}
