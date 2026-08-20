package models

type Mahasiswa struct {
	ID      uint   `json:"id" gorm:"primaryKey"`
	Nama    string `json:"nama" binding:"required"`
	NIM     string `json:"nim" gorm:"uniqueIndex" binding:"required"`
	Jurusan string `json:"jurusan" binding:"required"`
}
