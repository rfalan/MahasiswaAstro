package routes

import (
	"github.com/gin-gonic/gin"

	"api-mahasiswa/controllers"
)

func SetupRoutes(router *gin.Engine) {

	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API berhasil berjalan",
		})
	})

	router.GET("/mahasiswa", controllers.GetMahasiswa)

	router.GET("/mahasiswa/:id", controllers.GetMahasiswaByID)

	router.POST("/mahasiswa", controllers.CreateMahasiswa)

	router.PUT("/mahasiswa/:id", controllers.UpdateMahasiswa)

	router.DELETE("/mahasiswa/:id", controllers.DeleteMahasiswa)
}
