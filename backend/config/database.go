package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"asset-management-backend/models"
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

	// Optimize connection pooling for minimal CPU/RAM usage
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Run AutoMigrate to ensure schema consistency
	err = DB.AutoMigrate(
		&models.Branch{},
		&models.Site{},
		&models.Category{},
		&models.Asset{},
	)
	if err != nil {
		log.Printf("AutoMigrate warning/error: %v", err)
	}

	log.Println("Database connection established successfully.")
	return DB
}
