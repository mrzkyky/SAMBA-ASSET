package utils

import (
	"crypto/tls"
	"fmt"
	"log"
	"net"
	"net/smtp"
	"os"
	"strconv"
)

// SendOTPEmail sends a 6-digit verification code to the user via Google/Gmail SMTP
func SendOTPEmail(toEmail string, username string, otpCode string) error {
	smtpHost := getEnv("SMTP_HOST", "smtp.gmail.com")
	smtpPortStr := getEnv("SMTP_PORT", "587")
	smtpEmail := os.Getenv("SMTP_EMAIL")
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	appName := getEnv("APP_NAME", "SAMBA Asset Management")
	appURL := getEnv("APP_URL", "https://system-samba.my.id")

	// If SMTP credentials not provided, log OTP to console for debugging/development
	if smtpEmail == "" || smtpPassword == "" {
		log.Printf("\n=======================================================\n[DEV/SIMULATION EMAIL] Ke: %s (%s)\nKode OTP Verifikasi: %s (Berlaku 15 Menit)\n=======================================================\n", toEmail, username, otpCode)
		return nil
	}

	subject := fmt.Sprintf("Subject: [SAMBA Asset] Kode Verifikasi Pendaftaran: %s\r\n", otpCode)
	fromHeader := fmt.Sprintf("From: %s <%s>\r\n", appName, smtpEmail)
	toHeader := fmt.Sprintf("To: %s\r\n", toEmail)
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
  .container { max-width: 540px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  .header { background: linear-gradient(135deg, #0f172a, #083344); padding: 28px; text-align: center; border-bottom: 2px solid #06b6d4; }
  .title { color: #38bdf8; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
  .subtitle { color: #94a3b8; font-size: 12px; margin-top: 6px; }
  .content { padding: 32px 28px; }
  .greeting { font-size: 15px; color: #e2e8f0; margin-bottom: 16px; }
  .otp-box { background: #020617; border: 2px dashed #06b6d4; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
  .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #22d3ee; }
  .otp-desc { font-size: 12px; color: #64748b; margin-top: 8px; }
  .footer { background-color: #020617; padding: 18px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
  .link { color: #38bdf8; text-decoration: none; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1 class="title">SAMBA ASSET</h1>
    <div class="subtitle">System Asset Management Branch & Associates</div>
  </div>
  <div class="content">
    <p class="greeting">Halo <strong>%s</strong>,</p>
    <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">
      Terima kasih telah mendaftarkan akun di sistem manajemen aset nasional SAMBA. Silakan gunakan kode verifikasi (OTP) berikut untuk mengaktifkan akun Anda:
    </p>
    <div class="otp-box">
      <div class="otp-code">%s</div>
      <div class="otp-desc">Kode ini berlaku selama 15 menit. Jangan berikan kode ini kepada siapapun.</div>
    </div>
    <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
      Setelah memasukkan kode OTP, akun Anda akan aktif dengan hak akses <strong>Auditor (Read-Only)</strong>. Untuk meningkatkan hak akses menjadi Branch Admin atau Super Admin, silakan hubungi Administrator Utama.
    </p>
  </div>
  <div class="footer">
    Email otomatis dari sistem SAMBA Asset • <a href="%s" class="link">%s</a>
  </div>
</div>
</body>
</html>`, username, otpCode, appURL, appURL)

	msg := []byte(fromHeader + toHeader + subject + mime + htmlBody)
	return sendSMTP(smtpHost, smtpPortStr, smtpEmail, smtpPassword, toEmail, msg)
}

// SendInvitationEmail sends account credentials & RBAC role details to a newly invited user
func SendInvitationEmail(toEmail string, username string, password string, role string, branchName string) error {
	smtpHost := getEnv("SMTP_HOST", "smtp.gmail.com")
	smtpPortStr := getEnv("SMTP_PORT", "587")
	smtpEmail := os.Getenv("SMTP_EMAIL")
	smtpPassword := os.Getenv("SMTP_PASSWORD")
	appName := getEnv("APP_NAME", "SAMBA Asset Management")
	appURL := getEnv("APP_URL", "https://system-samba.my.id")

	if smtpEmail == "" || smtpPassword == "" {
		log.Printf("\n=======================================================\n[DEV/SIMULATION EMAIL UNDANGAN] Ke: %s\nUsername: %s | Pass: %s | Role: %s (%s)\n=======================================================\n", toEmail, username, password, role, branchName)
		return nil
	}

	subject := fmt.Sprintf("Subject: [SAMBA Asset] Akun Resmi & Hak Akses Anda Telah Dibuat\r\n")
	fromHeader := fmt.Sprintf("From: %s <%s>\r\n", appName, smtpEmail)
	toHeader := fmt.Sprintf("To: %s\r\n", toEmail)
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 24px; }
  .container { max-width: 540px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  .header { background: linear-gradient(135deg, #0f172a, #083344); padding: 28px; text-align: center; border-bottom: 2px solid #10b981; }
  .title { color: #34d399; font-size: 22px; font-weight: 800; margin: 0; }
  .subtitle { color: #94a3b8; font-size: 12px; margin-top: 6px; }
  .content { padding: 32px 28px; }
  .card { background: #020617; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 20px 0; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #0f172a; font-size: 13px; }
  .label { color: #94a3b8; }
  .value { color: #f8fafc; font-weight: 600; font-family: monospace; }
  .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 16px; }
  .footer { background-color: #020617; padding: 18px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1 class="title">AKSES RESMI SAMBA ASSET</h1>
    <div class="subtitle">System Asset Management Branch & Associates</div>
  </div>
  <div class="content">
    <p style="font-size: 15px; color: #e2e8f0;">Halo <strong>%s</strong>,</p>
    <p style="color: #cbd5e1; font-size: 13.5px; line-height: 1.6;">
      Super Administrator telah mendaftarkan dan mengonfigurasi hak akses akun Anda di sistem SAMBA Asset. Berikut rincian kredensial masuk Anda:
    </p>
    <div class="card">
      <div class="row"><span class="label">Username:</span> <span class="value">%s</span></div>
      <div class="row"><span class="label">Password Sementara:</span> <span class="value">%s</span></div>
      <div class="row"><span class="label">Tingkat Hak Akses (Role):</span> <span class="value" style="color: #38bdf8;">%s</span></div>
      <div class="row"><span class="label">Cakupan Cabang:</span> <span class="value" style="color: #34d399;">%s</span></div>
    </div>
    <div style="text-align: center;">
      <a href="%s" class="btn">Buka Portal SAMBA Asset & Masuk</a>
    </div>
  </div>
  <div class="footer">
    Harap segera ubah password Anda setelah berhasil masuk pertama kali • <a href="%s" style="color:#38bdf8;">%s</a>
  </div>
</div>
</body>
</html>`, username, username, password, role, branchName, appURL, appURL, appURL)

	msg := []byte(fromHeader + toHeader + subject + mime + htmlBody)
	return sendSMTP(smtpHost, smtpPortStr, smtpEmail, smtpPassword, toEmail, msg)
}

func sendSMTP(host string, port string, sender string, password string, to string, msg []byte) error {
	addr := net.JoinHostPort(host, port)
	auth := smtp.PlainAuth("", sender, password, host)

	// Port 465 uses direct SSL/TLS
	portNum, _ := strconv.Atoi(port)
	if portNum == 465 {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         host,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			log.Printf("Gagal koneksi TLS ke %s: %v", addr, err)
			return err
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, host)
		if err != nil {
			return err
		}
		defer client.Quit()

		if err = client.Auth(auth); err != nil {
			return err
		}
		if err = client.Mail(sender); err != nil {
			return err
		}
		if err = client.Rcpt(to); err != nil {
			return err
		}
		w, err := client.Data()
		if err != nil {
			return err
		}
		_, err = w.Write(msg)
		if err != nil {
			return err
		}
		return w.Close()
	}

	// Port 587 uses standard STARTTLS
	return smtp.SendMail(addr, auth, sender, []string{to}, msg)
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
