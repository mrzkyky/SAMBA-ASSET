package models

import (
	"time"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Email        string    `gorm:"size:100;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         string    `gorm:"size:20;default:'Auditor';index" json:"role"` // 'Super Admin', 'Branch Admin', 'Auditor'
	BranchID     *uint     `gorm:"index" json:"branch_id"`                      // Nullable for Super Admin
	Branch       *Branch   `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string  `json:"token"`
	User  UserDTO `json:"user"`
}

type UserDTO struct {
	ID        uint    `json:"id"`
	Username  string  `json:"username"`
	Email     string  `json:"email"`
	Role      string  `json:"role"`
	BranchID  *uint   `json:"branch_id"`
	Branch    *Branch `json:"branch,omitempty"`
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
	BranchID *uint  `json:"branch_id"`
}

type UpdateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
	BranchID *uint  `json:"branch_id"`
}

type Branch struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"size:50;uniqueIndex;not null" json:"code"`
	Name      string    `gorm:"size:100;not null" json:"name"`
	Province  string    `gorm:"size:100;not null" json:"province"`
	Sites     []Site    `gorm:"foreignKey:BranchID;constraint:OnDelete:CASCADE" json:"sites,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Site struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	BranchID    uint      `gorm:"not null;index" json:"branch_id"`
	Branch      *Branch   `gorm:"foreignKey:BranchID" json:"branch,omitempty"`
	PartnerName string    `gorm:"size:100;not null" json:"partner_name"`
	SiteName    string    `gorm:"size:100;not null" json:"site_name"`
	Address     string    `gorm:"type:text" json:"address"`
	Assets      []Asset   `gorm:"foreignKey:SiteID;constraint:OnDelete:CASCADE" json:"assets,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:100;uniqueIndex;not null" json:"name"`
	Assets    []Asset   `gorm:"foreignKey:CategoryID" json:"assets,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Asset struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	SiteID         uint      `gorm:"not null;index" json:"site_id"`
	Site           *Site     `gorm:"foreignKey:SiteID" json:"site,omitempty"`
	CategoryID     uint      `gorm:"not null;index" json:"category_id"`
	Category       *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Brand          string    `gorm:"size:100;not null" json:"brand"`
	Model          string    `gorm:"size:100;not null" json:"model"`
	SerialNumber   string    `gorm:"size:100;not null;index" json:"serial_number"`
	LocationDetail string    `gorm:"size:100;default:'Main Rack'" json:"location_detail"`
	UnitCount      int       `gorm:"default:1;not null" json:"unit_count"`
	Status         string    `gorm:"size:20;default:'Aktif';index" json:"status"` // 'Aktif', 'Rusak', 'Cadangan'
	Notes          string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type StatsResponse struct {
	TotalBranches   int64 `json:"total_branches"`
	TotalSites      int64 `json:"total_sites"`
	TotalCategories int64 `json:"total_categories"`
	TotalAssets     int64 `json:"total_assets"`
	TotalUnits      int64 `json:"total_units"`
	ActiveAssets    int64 `json:"active_assets"`
	DamagedAssets   int64 `json:"damaged_assets"`
	BackupAssets    int64 `json:"backup_assets"`
}

type CategoryGroupDTO struct {
	Category Category `json:"category"`
	Assets   []Asset  `json:"assets"`
}

type SiteGroupDTO struct {
	Site           Site               `json:"site"`
	CategoryGroups []CategoryGroupDTO `json:"category_groups"`
}

type BranchHierarchyDTO struct {
	Branch     Branch         `json:"branch"`
	SiteGroups []SiteGroupDTO `json:"site_groups"`
}
