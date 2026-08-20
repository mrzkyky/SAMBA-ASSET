package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"asset-management-backend/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgrespassword"
	}
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "asset_db"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Jakarta",
		host, user, password, dbname, port)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get DB instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// AutoMigrate all models including User
	err = DB.AutoMigrate(
		&models.Branch{},
		&models.Site{},
		&models.Category{},
		&models.Asset{},
		&models.User{},
	)
	if err != nil {
		log.Printf("AutoMigrate warning/error: %v", err)
	}

	// Ensure default seed users exist
	seedUsers()

	log.Println("Database connection established & auto-migrated successfully.")
	return DB
}

func seedUsers() {
	hashAdmin, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	hashBrebes, _ := bcrypt.GenerateFromPassword([]byte("brebes123"), bcrypt.DefaultCost)
	hashAuditor, _ := bcrypt.GenerateFromPassword([]byte("auditor123"), bcrypt.DefaultCost)

	branchIDBrebes := uint(1)

	defaultUsers := []models.User{
		{
			Username:     "admin",
			Email:        "admin@national-asset.id",
			PasswordHash: string(hashAdmin),
			Role:         "Super Admin",
			BranchID:     nil,
		},
		{
			Username:     "admin_brebes",
			Email:        "brebes@national-asset.id",
			PasswordHash: string(hashBrebes),
			Role:         "Branch Admin",
			BranchID:     &branchIDBrebes,
		},
		{
			Username:     "auditor",
			Email:        "auditor@national-asset.id",
			PasswordHash: string(hashAuditor),
			Role:         "Auditor",
			BranchID:     nil,
		},
	}

	for _, u := range defaultUsers {
		var existing models.User
		if err := DB.Where("username = ?", u.Username).First(&existing).Error; err != nil {
			// User does not exist, create it!
			if createErr := DB.Create(&u).Error; createErr != nil {
				log.Printf("Warning: Failed to seed user %s: %v", u.Username, createErr)
			} else {
				log.Printf("Successfully seeded default user: %s", u.Username)
			}
		}
	}
}
