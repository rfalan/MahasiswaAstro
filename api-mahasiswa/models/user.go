package models

import "time"

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Nama         string    `json:"nama"`
	Email        string    `json:"email" gorm:"uniqueIndex"`
	NIM          string    `json:"nim,omitempty" gorm:"uniqueIndex"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role" gorm:"default:admin"`
	MahasiswaID  *uint     `json:"mahasiswa_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}
