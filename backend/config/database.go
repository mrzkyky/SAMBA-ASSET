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

	// AutoMigrate all models
	err = DB.AutoMigrate(
		&models.Branch{},
		&models.Site{},
		&models.Category{},
		&models.Asset{},
		&models.User{},
		&models.AssetTransfer{},
		&models.AuditLog{},
	)
	if err != nil {
		log.Printf("AutoMigrate warning/error: %v", err)
	}

	// Explicitly widen serial_number column type to TEXT to support unlimited multi-SN strings
	if alterErr := DB.Exec("ALTER TABLE assets ALTER COLUMN serial_number TYPE TEXT;").Error; alterErr != nil {
		log.Printf("Notice on alter serial_number column: %v", alterErr)
	}

	// Ensure default seeds exist safely
	seedBranchesAndSites()
	seedCategories()
	seedUsers()

	log.Println("Database connection established & auto-migrated successfully.")
	return DB
}

func RecordAuditLog(userID *uint, username, action, details, ipAddress string) {
	if username == "" {
		username = "System"
	}
	logEntry := models.AuditLog{
		UserID:    userID,
		Username:  username,
		Action:    action,
		Details:   details,
		IPAddress: ipAddress,
		CreatedAt: time.Now(),
	}
	DB.Create(&logEntry)
}

func seedBranchesAndSites() {
	var count int64
	DB.Model(&models.Branch{}).Count(&count)
	if count == 0 {
		branches := []models.Branch{
			{Code: "BR-BRB", Name: "Branch Brebes", Province: "Jawa Tengah"},
			{Code: "BR-BDG", Name: "Branch Bandung", Province: "Jawa Barat"},
			{Code: "BR-SBY", Name: "Branch Surabaya", Province: "Jawa Timur"},
			{Code: "BR-JKT", Name: "Branch Jakarta Pusat", Province: "DKI Jakarta"},
			{Code: "BR-MDN", Name: "Branch Medan", Province: "Sumatera Utara"},
		}
		for _, b := range branches {
			DB.Create(&b)
		}
		log.Println("Seeded default branches successfully.")

		// Seed initial sites under Branch Brebes
		var brebesBranch models.Branch
		if err := DB.Where("code = ?", "BR-BRB").First(&brebesBranch).Error; err == nil {
			sites := []models.Site{
				{BranchID: brebesBranch.ID, PartnerName: "MAN 1 Brebes", SiteName: "Site Brebes", Address: "Jl. Yos Sudarso No. 16, Brebes"},
				{BranchID: brebesBranch.ID, PartnerName: "SMA N 1 Brebes", SiteName: "Site Brebes", Address: "Jl. Dr. Setiabudi No. 11, Brebes"},
				{BranchID: brebesBranch.ID, PartnerName: "SMA N 2 Brebes", SiteName: "Site Brebes", Address: "Jl. Jenderal A. Yani No. 77, Brebes"},
			}
			for _, s := range sites {
				DB.Create(&s)
			}
			log.Println("Seeded default sites under Branch Brebes.")
		}
	}
}

func seedCategories() {
	categories := []string{
		"Access Point", "AOC", "Akses Kontrol", "ATN", "Baterai", "CRS",
		"DCDU", "Firewall", "Inline Atenuator", "Inverter", "Kipas Mini",
		"LHG", "MC", "Microwave (ODU, IDU, Kabel)", "MikroTik", "OLT",
		"ONT", "OTB", "Patch Cord", "PSU", "Rack Server", "Rectifier",
		"Router", "RTN", "Server", "SFP", "Step Down / Step Up", "Switch",
		"UPS & Power",
	}

	for _, name := range categories {
		var existing models.Category
		if err := DB.Where("name = ?", name).First(&existing).Error; err != nil {
			c := models.Category{Name: name}
			if createErr := DB.Create(&c).Error; createErr == nil {
				log.Printf("Seeded default category: %s", name)
			}
		}
	}
}

func seedUsers() {
	hashAdmin, _ := bcrypt.GenerateFromPassword([]byte("admin123"), 14)
	hashBrebes, _ := bcrypt.GenerateFromPassword([]byte("brebes123"), 14)
	hashAuditor, _ := bcrypt.GenerateFromPassword([]byte("auditor123"), 14)

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
			if createErr := DB.Create(&u).Error; createErr != nil {
				log.Printf("Warning: Failed to seed user %s: %v", u.Username, createErr)
			}
		} else {
			// Ensure password hash for default users is always valid bcrypt hash of default passwords
			existing.PasswordHash = u.PasswordHash
			DB.Save(&existing)
		}
	}
}
