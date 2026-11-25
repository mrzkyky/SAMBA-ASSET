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

	subject := fmt.Sprintf("Subject: [SAMBA ASSET] Kode Verifikasi Akun: %s\r\n", otpCode)
	fromHeader := fmt.Sprintf("From: %s <%s>\r\n", appName, smtpEmail)
	toHeader := fmt.Sprintf("To: %s\r\n", toEmail)
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F4F2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #27332F; line-height: 1.6;">

  <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F2EB; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container: Clean White Surface -->
        <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E4E5DC; box-shadow: 0 4px 16px rgba(24, 59, 58, 0.06);">
          
          <!-- Official Corporate Header: Deep Forest Green -->
          <tr>
            <td style="background-color: #183B3A; padding: 32px 36px; border-bottom: 3px solid #D9A441;">
              <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #FFFFFF; margin: 0;">
                      SAMBA ASSET <span style="font-size: 11px; background-color: rgba(217, 164, 65, 0.25); color: #D9A441; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(217, 164, 65, 0.4); margin-left: 6px; vertical-align: middle;">v3.0</span>
                    </div>
                    <div style="font-size: 11px; color: #A8D3C8; font-weight: 500; margin-top: 4px; letter-spacing: 0.3px;">
                      System Asset Management Branch & Associates
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 700; color: #DDF3EC; text-transform: uppercase; letter-spacing: 1px; background-color: rgba(36, 84, 81, 0.8); padding: 5px 10px; border-radius: 8px; border: 1px solid #245451;">
                      Verifikasi Resmi
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Letter Body Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="font-size: 15px; color: #27332F; margin: 0 0 16px 0; font-weight: 600;">
                Yth. Bapak/Ibu <strong>%s</strong>,
              </p>
              <p style="font-size: 13.5px; color: #52635B; margin: 0 0 24px 0; line-height: 1.6;">
                Pendaftaran akun Anda pada portal <strong>SAMBA ASSET</strong> telah diterima. Untuk mengonfirmasi kepemilikan alamat email dan mengaktifkan akses Anda, silakan gunakan kode verifikasi (OTP) resmi berikut:
              </p>

              <!-- OTP Callout Block (Clean, Elegant, High-Contrast) -->
              <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #F8F7F2; border: 1.5px dashed #0F766E; border-radius: 12px; padding: 24px 16px;">
                    <span style="font-size: 11px; font-weight: 700; color: #718078; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 8px;">
                      Kode Verifikasi Sekali Pakai (OTP)
                    </span>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0F766E; padding: 6px 0;">
                      %s
                    </div>
                    <span style="font-size: 11px; color: #C58B32; font-weight: 600; display: block; margin-top: 8px;">
                      Berlaku selama 15 menit • Jangan dibagikan kepada siapapun
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Explanation Note -->
              <div style="background-color: #F4F2EB; border-left: 3px solid #0F766E; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="font-size: 12px; color: #52635B; margin: 0; line-height: 1.5;">
                  Setelah verifikasi selesai, akun Anda akan aktif dengan hak akses <strong>Auditor (Read-Only)</strong>. Peningkatan wewenang administratif dapat dikoordinasikan langsung bersama Super Administrator regional.
                </p>
              </div>

              <p style="font-size: 12.5px; color: #718078; margin: 0; line-height: 1.5;">
                Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan pesan ini atau laporkan kepada tim keamanan IT SAMBA.
              </p>
            </td>
          </tr>

          <!-- Formal Sign-Off Footer -->
          <tr>
            <td style="background-color: #F8F7F2; border-top: 1px solid #E4E5DC; padding: 22px 36px; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; color: #183B3A; margin: 0 0 4px 0;">
                SAMBA Asset Management System
              </p>
              <p style="font-size: 11px; color: #8A9890; margin: 0;">
                Email otomatis terenkripsi • <a href="%s" style="color: #0F766E; text-decoration: none; font-weight: 600;">%s</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

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

	subject := fmt.Sprintf("Subject: [SAMBA ASSET] Kredensial Akses Akun Resmi\r\n")
	fromHeader := fmt.Sprintf("From: %s <%s>\r\n", appName, smtpEmail)
	toHeader := fmt.Sprintf("To: %s\r\n", toEmail)
	mime := "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #F4F2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #27332F; line-height: 1.6;">

  <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F4F2EB; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E4E5DC; box-shadow: 0 4px 16px rgba(24, 59, 58, 0.06);">
          
          <!-- Corporate Header -->
          <tr>
            <td style="background-color: #183B3A; padding: 32px 36px; border-bottom: 3px solid #D9A441;">
              <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 0.5px; color: #FFFFFF; margin: 0;">
                      SAMBA ASSET <span style="font-size: 11px; background-color: rgba(217, 164, 65, 0.25); color: #D9A441; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(217, 164, 65, 0.4); margin-left: 6px; vertical-align: middle;">v3.0</span>
                    </div>
                    <div style="font-size: 11px; color: #A8D3C8; font-weight: 500; margin-top: 4px;">
                      System Asset Management Branch & Associates
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 700; color: #DDF3EC; text-transform: uppercase; letter-spacing: 1px; background-color: rgba(36, 84, 81, 0.8); padding: 5px 10px; border-radius: 8px; border: 1px solid #245451;">
                      Kredensial Akses
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <p style="font-size: 15px; color: #27332F; margin: 0 0 16px 0; font-weight: 600;">
                Yth. Bapak/Ibu <strong>%s</strong>,
              </p>
              <p style="font-size: 13.5px; color: #52635B; margin: 0 0 24px 0; line-height: 1.6;">
                Administrator telah mendaftarkan akun resmi Anda pada platform <strong>SAMBA ASSET</strong>. Rincian kredensial dan hak akses Anda adalah sebagai berikut:
              </p>

              <!-- Credentials Table Box -->
              <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F7F2; border: 1px solid #E4E5DC; border-radius: 12px; margin: 20px 0; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 12.5px; color: #718078; font-weight: 600; width: 40%%;">
                    Username
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 13px; color: #27332F; font-weight: 700; font-family: monospace;">
                    %s
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 12.5px; color: #718078; font-weight: 600;">
                    Password Sementara
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 13px; color: #0F766E; font-weight: 700; font-family: monospace;">
                    %s
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 12.5px; color: #718078; font-weight: 600;">
                    Tingkat Wewenang (Role)
                  </td>
                  <td style="padding: 12px 18px; border-bottom: 1px solid #E4E5DC; font-size: 13px; color: #183B3A; font-weight: 700;">
                    %s
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 18px; font-size: 12.5px; color: #718078; font-weight: 600;">
                    Cakupan Cabang
                  </td>
                  <td style="padding: 12px 18px; font-size: 13px; color: #16845B; font-weight: 700;">
                    %s
                  </td>
                </tr>
              </table>

              <!-- Button CTA -->
              <table role="presentation" width="100%%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 16px 0;">
                <tr>
                  <td align="center">
                    <a href="%s" target="_blank" style="display: inline-block; background-color: #0F766E; color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.25);">
                      Buka Portal & Masuk ke Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 11.5px; color: #C58B32; text-align: center; margin: 0 0 10px 0; font-weight: 600;">
                * Demi keamanan, disarankan untuk segera memperbarui password setelah berhasil masuk pertama kali.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F7F2; border-top: 1px solid #E4E5DC; padding: 22px 36px; text-align: center;">
              <p style="font-size: 12px; font-weight: 700; color: #183B3A; margin: 0 0 4px 0;">
                SAMBA Asset Management System
              </p>
              <p style="font-size: 11px; color: #8A9890; margin: 0;">
                Email otomatis terenkripsi • <a href="%s" style="color: #0F766E; text-decoration: none; font-weight: 600;">%s</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

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
		defer w.Close()

		_, err = w.Write(msg)
		return err
	}

	// Port 587 uses STARTTLS
	tlsConfig := &tls.Config{
		InsecureSkipVerify: false,
		ServerName:         host,
	}

	conn, err := net.Dial("tcp", addr)
	if err != nil {
		log.Printf("Gagal koneksi ke %s: %v", addr, err)
		return err
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}
	defer client.Quit()

	if ok, _ := client.Extension("STARTTLS"); ok {
		if err = client.StartTLS(tlsConfig); err != nil {
			log.Printf("Gagal StartTLS: %v", err)
			return err
		}
	}

	if err = client.Auth(auth); err != nil {
		log.Printf("Gagal autentikasi SMTP: %v", err)
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
	defer w.Close()

	_, err = w.Write(msg)
	return err
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
