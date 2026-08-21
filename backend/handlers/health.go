package handlers

import (
	"net/http"

	"asset-management-backend/config"
	"asset-management-backend/models"
	"asset-management-backend/utils"
	"github.com/gin-gonic/gin"
)

// HealthCheck is a public diagnostic endpoint to verify database state
func HealthCheck(c *gin.Context) {
	var branchCount, siteCount, categoryCount, assetCount, userCount int64

	config.DB.Model(&models.Branch{}).Count(&branchCount)
	config.DB.Model(&models.Site{}).Count(&siteCount)
	config.DB.Model(&models.Category{}).Count(&categoryCount)
	config.DB.Model(&models.Asset{}).Count(&assetCount)
	config.DB.Model(&models.User{}).Count(&userCount)

	// List all users (username & role only, no password)
	var users []models.User
	config.DB.Select("id, username, email, role, branch_id").Find(&users)

	type UserInfo struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Role     string `json:"role"`
		BranchID *uint  `json:"branch_id"`
	}
	userInfos := make([]UserInfo, len(users))
	for i, u := range users {
		userInfos[i] = UserInfo{
			ID:       u.ID,
			Username: u.Username,
			Email:    u.Email,
			Role:     u.Role,
			BranchID: u.BranchID,
		}
	}

	// Verify admin password hash validity
	var adminUser models.User
	adminPasswordOK := false
	adminHashPrefix := "N/A"
	if err := config.DB.Where("username = ?", "admin").First(&adminUser).Error; err == nil {
		adminPasswordOK = utils.CheckPasswordHash("admin123", adminUser.PasswordHash)
		if len(adminUser.PasswordHash) >= 10 {
			adminHashPrefix = adminUser.PasswordHash[:10]
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "OK",
		"message": "SAMBA ASSET Health Check",
		"database": gin.H{
			"branches":   branchCount,
			"sites":      siteCount,
			"categories": categoryCount,
			"assets":     assetCount,
			"users":      userCount,
		},
		"users_list": userInfos,
		"admin_password_check": gin.H{
			"user_found":       adminUser.ID > 0,
			"password_matches": adminPasswordOK,
			"hash_prefix":      adminHashPrefix,
		},
	})
}
