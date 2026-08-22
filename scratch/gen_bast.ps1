$hBytes = [System.IO.File]::ReadAllBytes("c:\Users\ThinkPad\OneDrive\Documents\SAMBA-Asset\frontend\public\images\bast_header.png")
$fBytes = [System.IO.File]::ReadAllBytes("c:\Users\ThinkPad\OneDrive\Documents\SAMBA-Asset\frontend\public\images\bast_footer.png")

$hB64 = [System.Convert]::ToBase64String($hBytes)
$fB64 = [System.Convert]::ToBase64String($fBytes)

$content = "// Auto-generated BAST Header & Footer Base64 Templates`n" +
"export const DEFAULT_BAST_HEADER = `"data:image/png;base64,$hB64`";`n`n" +
"export const DEFAULT_BAST_FOOTER = `"data:image/png;base64,$fB64`";`n"

[System.IO.Directory]::CreateDirectory("c:\Users\ThinkPad\OneDrive\Documents\SAMBA-Asset\frontend\src\assets")
[System.IO.File]::WriteAllText("c:\Users\ThinkPad\OneDrive\Documents\SAMBA-Asset\frontend\src\assets\bastTemplates.js", $content)

Write-Host "SUCCESS! bastTemplates.js generated."
