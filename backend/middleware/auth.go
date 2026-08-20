package middleware

import (
	"net/http"
	"strings"

	"asset-management-backend/utils"
	"github.com/gin-gonic/gin"
)

// JWTAuthMiddleware verifies JWT token from Authorization header
func JWTAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Header Otorisasi (Authorization Token) diperlukan"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Format Authorization header harus 'Bearer <token>'"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token sesi tidak valid atau telah kedaluwarsa"})
			c.Abort()
			return
		}

		// Store user details in context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("user_role", claims.Role)
		if claims.BranchID != nil {
			c.Set("user_branch_id", *claims.BranchID)
		}

		c.Next()
	}
}

// RequireRoles enforces specific user roles for endpoint execution
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusForbidden, gin.H{"error": "Role pengguna tidak teridentifikasi"})
			c.Abort()
			return
		}

		userRole := roleVal.(string)
		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, gin.H{"error": "Anda tidak memiliki izin (role) untuk melakukan aksi ini"})
		c.Abort()
	}
}
