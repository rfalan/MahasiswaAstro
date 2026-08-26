package models

import "time"

type Magang struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	MahasiswaID uint      `json:"mahasiswa_id" gorm:"index;not null"`
	Mahasiswa   Mahasiswa `json:"mahasiswa" gorm:"foreignKey:MahasiswaID"`
	Perusahaan  string    `json:"perusahaan"`
	Posisi      string    `json:"posisi"`
	Status      string    `json:"status" gorm:"default:diajukan;index"`
	Catatan     string    `json:"catatan"`
	DokumenURL  string    `json:"dokumen_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
