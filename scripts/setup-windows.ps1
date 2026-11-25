param(
    [switch] $Demo,
    [switch] $Serve
)

$ErrorActionPreference = 'Stop'

function Invoke-SetupCommand {
    param([string] $Program, [string[]] $Arguments)

    & $Program @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Program failed with exit code $LASTEXITCODE."
    }
}

Push-Location (Join-Path $PSScriptRoot '..')
try {
    foreach ($program in @('php', 'composer', 'node', 'npm.cmd')) {
        Get-Command $program -ErrorAction Stop | Out-Null
    }

    if (-not (Test-Path '.env')) {
        Copy-Item '.env.example' '.env'
    }

    $databasePassword = Get-Content '.env' | Where-Object { $_ -match '^DB_PASSWORD=' } | Select-Object -First 1
    if (-not $databasePassword -or $databasePassword -match '^DB_PASSWORD=(\s*|""|\x27\x27)$') {
        throw 'Set DB_PASSWORD in .env first. See README-WINDOWS.md for the MariaDB setup.'
    }

    Invoke-SetupCommand 'composer' @('install', '--no-interaction')
    if (Select-String -Path '.env' -Pattern '^APP_KEY=\s*$' -Quiet) {
        Invoke-SetupCommand 'php' @('artisan', 'key:generate')
    }

    Invoke-SetupCommand 'php' @('artisan', 'migrate')
    if ($Demo) {
        Invoke-SetupCommand 'php' @('artisan', 'db:seed')
    }

    Invoke-SetupCommand 'npm.cmd' @('ci')
    Invoke-SetupCommand 'npm.cmd' @('run', 'build')
    Invoke-SetupCommand 'npm.cmd' @('run', 'types:check')
    Invoke-SetupCommand 'php' @('artisan', 'test')

    Write-Host 'SpendSense setup and checks finished.'
    if ($Serve) {
        Invoke-SetupCommand 'php' @('artisan', 'serve')
    } else {
        Write-Host 'Run php artisan serve, then open http://127.0.0.1:8000.'
    }
} finally {
    Pop-Location
}
