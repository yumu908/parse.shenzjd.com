$candidates = @(
    "C:\Program Files\nodejs\node.exe",
    "C:\Program Files (x86)\nodejs\node.exe",
    "D:\Program Files\nodejs\node.exe",
    "C:\Users\intel\AppData\Roaming\nvm\v20.11.0\node.exe",
    "C:\Users\intel\AppData\Roaming\nvm\v18.18.0\node.exe",
    "C:\Users\intel\AppData\Local\Programs\node\node.exe"
)

$foundNode = $null
foreach ($c in $candidates) {
    if (Test-Path $c) {
        $foundNode = $c
        break
    }
}

if (-not $foundNode) {
    $foundNode = (Get-ChildItem -Path "C:\Program Files\nodejs", "C:\Users\intel\AppData\Roaming\nvm", "C:\Program Files", "D:\" -Filter "node.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
}

if ($foundNode) {
    Write-Host "FOUND: $foundNode"
    $nodeDir = Split-Path -Path $foundNode -Parent
    $env:PATH = "$nodeDir;C:\Users\intel\AppData\Roaming\npm;$env:PATH"
    & "$nodeDir\npm.cmd" run build
} else {
    Write-Host "NOT FOUND ANYWHERE"
}
