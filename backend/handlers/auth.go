package handlers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"time"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"asset-management-backend/utils"
	"github.com/gin-gonic/gin"
)

// generateSecureOTP generates a 6-digit numeric OTP string
func generateSecureOTP() string {
	nBig, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "789123"
	}
	return fmt.Sprintf("%06d", nBig.Int64()+100000)
}

// Register registers a new user with default Auditor (read-only) role and dispatches Google SMTP OTP
func Register(c *gin.Context) {
	var input models.RegisterRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data registrasi tidak lengkap atau format email tidak valid", "debug": err.Error()})
		return
	}

	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	// Check if username or email already exists
	var existingUser models.User
	if err := config.DB.Where("username = ? OR email = ?", input.Username, input.Email).First(&existingUser).Error; err == nil {
		// If the account is already active and verified, reject duplicate
		if existingUser.IsVerified {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username atau Email sudah terdaftar dan aktif. Silakan langsung masuk (login) atau gunakan email lain."})
			return
		}

		// If user exists BUT NOT VERIFIED yet, update pending registration with fresh credentials & new OTP
		hashedPassword, err := utils.HashPassword(input.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
			return
		}

		otpCode := generateSecureOTP()
		expiresAt := time.Now().Add(15 * time.Minute)

		existingUser.Username = input.Username
		existingUser.Email = input.Email
		existingUser.PasswordHash = hashedPassword
		existingUser.Role = "Auditor"
		existingUser.BranchID = input.BranchID
		existingUser.VerificationOTP = otpCode
		existingUser.OTPExpiresAt = &expiresAt

		if err := config.DB.Save(&existingUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal memperbarui data pendaftaran"})
			return
		}

		// Dispatch fresh OTP email in background
		go func(toEmail, username, otp string) {
			_ = utils.SendOTPEmail(toEmail, username, otp)
		}(existingUser.Email, existingUser.Username, otpCode)

		c.JSON(http.StatusOK, gin.H{
			"message": "Pendaftaran diperbarui! Kode verifikasi (OTP) 6-digit baru telah dikirim ke email Anda.",
			"data": gin.H{
				"email":    existingUser.Email,
				"username": existingUser.Username,
			},
		})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengenkripsi password"})
		return
	}

	otpCode := generateSecureOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	user := models.User{
		Username:        input.Username,
		Email:           input.Email,
		PasswordHash:    hashedPassword,
		Role:            "Auditor", // Default restricted role upon self-registration
		BranchID:        input.BranchID,
		IsVerified:      false,
		VerificationOTP: otpCode,
		OTPExpiresAt:    &expiresAt,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan pendaftaran akun", "debug": err.Error()})
		return
	}

	// Dispatch OTP Email in background
	go func(toEmail, username, otp string) {
		_ = utils.SendOTPEmail(toEmail, username, otp)
	}(user.Email, user.Username, otpCode)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Pendaftaran berhasil! Kode verifikasi (OTP) 6-digit telah dikirim ke alamat email Anda.",
		"data": gin.H{
			"email":    user.Email,
			"username": user.Username,
		},
	})
}

// VerifyEmail verifies the 6-digit OTP code and activates the user account
func VerifyEmail(c *gin.Context) {
	var input models.VerifyEmailRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email dan Kode OTP wajib diisi"})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.OTP = strings.TrimSpace(input.OTP)

	var user models.User
	if err := config.DB.Preload("Branch").Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Akun dengan email tersebut tidak ditemukan"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusOK, gin.H{"message": "Akun sudah terverifikasi sebelumnya. Silakan langsung login."})
		return
	}

	if user.VerificationOTP == "" || user.VerificationOTP != input.OTP {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP salah atau tidak valid. Periksa kembali email Anda."})
		return
	}

	if user.OTPExpiresAt != nil && time.Now().After(*user.OTPExpiresAt) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Kode OTP sudah kadaluwarsa (lebih dari 15 menit). Silakan minta kode OTP baru."})
		return
	}

	// Mark verified and clear OTP
	user.IsVerified = true
	user.VerificationOTP = ""
	user.OTPExpiresAt = nil
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengaktifkan akun"})
		return
	}

	// Generate auto-login JWT token
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, user.BranchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Akun aktif, namun gagal membuat token sesi otomatis"})
		return
	}

	userDTO := models.UserDTO{
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Role:       user.Role,
		BranchID:   user.BranchID,
		Branch:     user.Branch,
		IsVerified: user.IsVerified,
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Akun Anda berhasil diverifikasi dan diaktifkan!",
		"data": models.LoginResponse{
			Token: token,
			User:  userDTO,
		},
	})
}

// ResendOTP generates a new OTP and sends it to the user's email
func ResendOTP(c *gin.Context) {
	var input models.ResendOTPRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Alamat email wajib diisi"})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email tidak ditemukan"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Akun ini sudah terverifikasi aktif"})
		return
	}

	otpCode := generateSecureOTP()
	expiresAt := time.Now().Add(15 * time.Minute)

	user.VerificationOTP = otpCode
	user.OTPExpiresAt = &expiresAt
	config.DB.Save(&user)

	go func(toEmail, username, otp string) {
		_ = utils.SendOTPEmail(toEmail, username, otp)
	}(user.Email, user.Username, otpCode)

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Kode OTP baru berhasil dikirim ke %s. Berlaku 15 menit.", user.Email),
	})
}

// Login verifies username/email & password, enforcing verified account status
func Login(c *gin.Context) {
	var input models.LoginRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Format data login tidak valid", "debug": err.Error()})
		return
	}

	input.Username = strings.TrimSpace(input.Username)

	var user models.User
	// Allow login with either Username or Email
	if err := config.DB.Preload("Branch").Where("username = ? OR email = ?", input.Username, strings.ToLower(input.Username)).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Akun tidak ditemukan. Periksa kembali username atau email Anda.",
		})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Password salah.",
		})
		return
	}

	// Check if account is verified
	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"error":          "Akun Anda belum diverifikasi. Silakan masukkan kode OTP yang telah dikirim ke email.",
			"is_unverified":  true,
			"email":          user.Email,
			"username":       user.Username,
		})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, user.BranchID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuat token autentikasi"})
		return
	}

	userDTO := models.UserDTO{
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Role:       user.Role,
		BranchID:   user.BranchID,
		Branch:     user.Branch,
		IsVerified: user.IsVerified,
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
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Role:       user.Role,
		BranchID:   user.BranchID,
		Branch:     user.Branch,
		IsVerified: user.IsVerified,
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
			ID:         u.ID,
			Username:   u.Username,
			Email:      u.Email,
			Role:       u.Role,
			BranchID:   u.BranchID,
			Branch:     u.Branch,
			IsVerified: u.IsVerified,
		}
	}

	c.JSON(http.StatusOK, gin.H{"data": userDTOs})
}

// CreateUser creates a new user account with Super Admin defined role & sends email invitation
func CreateUser(c *gin.Context) {
	var input models.CreateUserRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.TrimSpace(strings.ToLower(input.Email))

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
		IsVerified:   true, // Admin created accounts are verified immediately
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Gagal membuat user. Pastikan username dan email belum terdaftar."})
		return
	}

	config.DB.Preload("Branch").First(&user, user.ID)

	branchName := "Semua Cabang (Nasional)"
	if user.Branch != nil {
		branchName = fmt.Sprintf("%s (%s)", user.Branch.Name, user.Branch.Code)
	}

	// Dispatch official invitation email to user
	go func(toEmail, username, pass, role, branch string) {
		_ = utils.SendInvitationEmail(toEmail, username, pass, role, branch)
	}(user.Email, user.Username, input.Password, user.Role, branchName)

	userDTO := models.UserDTO{
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Role:       user.Role,
		BranchID:   user.BranchID,
		Branch:     user.Branch,
		IsVerified: user.IsVerified,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": fmt.Sprintf("User %s berhasil dibuat dan email kredensial resmi telah dikirim ke %s.", user.Username, user.Email),
		"data":    userDTO,
	})
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
		user.Email = strings.TrimSpace(strings.ToLower(input.Email))
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
		ID:         user.ID,
		Username:   user.Username,
		Email:      user.Email,
		Role:       user.Role,
		BranchID:   user.BranchID,
		Branch:     user.Branch,
		IsVerified: user.IsVerified,
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
