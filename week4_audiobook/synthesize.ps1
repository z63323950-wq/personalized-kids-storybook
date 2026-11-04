param([Parameter(Mandatory=$true)][string]$StoryPath, [Parameter(Mandatory=$true)][string]$OutputDir)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$story = Get-Content -LiteralPath $StoryPath -Raw -Encoding UTF8 | ConvertFrom-Json
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$voices = @{'旁白'='Microsoft Huihui Desktop'; '小月'='Microsoft Yaoyao'; '栗栗'='Microsoft Kangkang'; '露露'='Microsoft Huihui'}
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $index = 0
  foreach ($item in $story.segments) {
    if (-not $voices.ContainsKey([string]$item.role)) { throw "Unknown role: $($item.role)" }
    $synth.SelectVoice($voices[[string]$item.role])
    $synth.Rate = switch ([string]$item.emotion) { '兴奋' { 0 } '惊喜' { -1 } '轻快' { -1 } '安静' { -3 } '轻声' { -3 } default { -2 } }
    $synth.Volume = 100
    $file = Join-Path $OutputDir ('{0:D3}.wav' -f $index)
    $synth.SetOutputToWaveFile($file)
    $synth.Speak([string]$item.text)
    $synth.SetOutputToNull()
    $index++
  }
} finally { $synth.Dispose() }
