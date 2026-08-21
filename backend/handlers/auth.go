package handlers

import (
	"fmt"
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"asset-management-backend/utils"
	"github.com/gin-gonic/gin"
)

// Login verifies username & password, returning signed JWT
func Login(c *gin.Context) {
	var input models.LoginRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data login tidak valid", "debug": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Preload("Branch").Where("username = ?", input.Username).First(&user).Error; err != nil {
		// Count total users in DB for diagnostic
		var userCount int64
		config.DB.Model(&models.User{}).Count(&userCount)
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":       "Username tidak ditemukan di database",
			"debug_info":  fmt.Sprintf("Username '%s' tidak ditemukan. Total user di database: %d", input.Username, userCount),
		})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":      "Password salah",
			"debug_info": fmt.Sprintf("User '%s' ditemukan (ID: %d, Role: %s), tapi password tidak cocok. Hash prefix: %s...", user.Username, user.ID, user.Role, user.PasswordHash[:10]),
		})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, user.BranchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		return
	}

	userDTO := models.UserDTO{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		BranchID: user.BranchID,
		Branch:   user.Branch,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"data": models.LoginResponse{
			Token: token,
			User:  userDTO,
		},
	})
}

// GetProfile returns current logged in user details
func GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := config.DB.Preload("Branch").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	userDTO := models.UserDTO{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		BranchID: user.BranchID,
		Branch:   user.Branch,
	}

	c.JSON(http.StatusOK, gin.H{"data": userDTO})
}

// GetUsers returns list of users for User Management UI (Super Admin only)
func GetUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Preload("Branch").Order("id ASC").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil daftar pengguna"})
		return
	}

	userDTOs := make([]models.UserDTO, len(users))
	for i, u := range users {
		userDTOs[i] = models.UserDTO{
			ID:       u.ID,
			Username: u.Username,
			Email:    u.Email,
			Role:     u.Role,
			BranchID: u.BranchID,
			Branch:   u.Branch,
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": userDTOs})
}

// CreateUser creates a new user account (Super Admin only)
func CreateUser(c *gin.Context) {
	var input models.CreateUserRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memproses enkripsi password"})
		return
	}

	user := models.User{
		Username:     input.Username,
		Email:        input.Email,
		PasswordHash: hashedPassword,
		Role:         input.Role,
		BranchID:     input.BranchID,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat user. Pastikan username dan email belum terdaftar."})
		return
	}

	config.DB.Preload("Branch").First(&user, user.ID)

	userDTO := models.UserDTO{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		BranchID: user.BranchID,
		Branch:   user.Branch,
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User berhasil dibuat", "data": userDTO})
}

// UpdateUser updates an existing user profile/role/branch (Super Admin only)
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}

	var input models.UpdateUserRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Email != "" {
		user.Email = input.Email
	}
	if input.Role != "" {
		user.Role = input.Role
	}
	user.BranchID = input.BranchID

	if input.Password != "" {
		hashed, err := utils.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal meng-enkripsi password baru"})
			return
		}
		user.PasswordHash = hashed
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui data user"})
		return
	}

	config.DB.Preload("Branch").First(&user, user.ID)

	userDTO := models.UserDTO{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     user.Role,
		BranchID: user.BranchID,
		Branch:   user.Branch,
	}

	c.JSON(http.StatusOK, gin.H{"message": "User berhasil diperbarui", "data": userDTO})
}

// DeleteUser deletes a user account (Super Admin only)
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User berhasil dihapus"})
}
