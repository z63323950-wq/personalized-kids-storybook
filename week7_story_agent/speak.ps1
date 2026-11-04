param([Parameter(Mandatory=$true)][string]$TextPath,[Parameter(Mandatory=$true)][string]$WavPath)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$synth=New-Object System.Speech.Synthesis.SpeechSynthesizer
try { $synth.SelectVoice('Microsoft Huihui Desktop'); $synth.Rate=-2; $synth.SetOutputToWaveFile($WavPath); $synth.Speak((Get-Content -LiteralPath $TextPath -Raw -Encoding UTF8)); $synth.SetOutputToNull() } finally { $synth.Dispose() }
