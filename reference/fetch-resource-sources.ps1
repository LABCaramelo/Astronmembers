param([switch]$InspectSaved, [string[]]$OnlyPath = @())
$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $PSScriptRoot 'resources'
New-Item -ItemType Directory -Path $destination -Force | Out-Null

$dataSource = Get-Content -LiteralPath (Join-Path $workspace 'js/data.js') -Raw
$paths = @([regex]::Matches($dataSource, 'recursos/[^"'']+\.html') | ForEach-Object { $_.Value })
$paths += 'recursos/index.html'
$paths += 'recursos/astron-pages.html'
$paths += 'planos.html'
$paths = @($paths | Sort-Object -Unique)
$inventory = [System.Collections.Generic.List[object]]::new()
$previousPages = @{}
if (($InspectSaved -or $OnlyPath.Count) -and (Test-Path -LiteralPath (Join-Path $destination 'inventory.json'))) {
  $previous = Get-Content -LiteralPath (Join-Path $destination 'inventory.json') -Raw | ConvertFrom-Json
  foreach ($page in $previous.pages) { $previousPages[$page.path] = $page }
}
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.AllowAutoRedirect = $false
$client = [System.Net.Http.HttpClient]::new($handler)
$client.Timeout = [TimeSpan]::FromSeconds(40)

function Get-AttributeValue([string]$attributes, [string]$name) {
  $match = [regex]::Match($attributes, '\b' + [regex]::Escape($name) + '\s*=\s*["'']([^"'']*)["'']', 'IgnoreCase')
  if ($match.Success) { return [System.Net.WebUtility]::HtmlDecode($match.Groups[1].Value) }
  return $null
}

function Get-PlainText([string]$html) {
  return ([System.Net.WebUtility]::HtmlDecode(($html -replace '<[^>]+>', ' ')) -replace '\s+', ' ').Trim()
}

foreach ($path in $paths) {
  $url = if ($path -eq 'recursos/index.html') { 'https://www.astronmembers.com.br/recursos/' } else { 'https://www.astronmembers.com.br/' + $path }
  $filename = Split-Path -Leaf $path
  $record = [ordered]@{
    path = $path
    localRoute = if ($path -eq 'recursos/index.html') { '/recursos/' } else { '/' + $path }
    url = $url
    finalUrl = $url
    redirects = @()
    file = 'reference/resources/' + $filename
    status = $null
    title = $null
    h1 = @()
    bodyClasses = $null
    scripts = @()
    stylesheets = @()
    images = @()
    inlineScripts = @()
    error = $null
  }
  try {
    if ($InspectSaved -or ($OnlyPath.Count -and $path -notin $OnlyPath)) {
      $savedPage = $previousPages[$path]
      if (!$savedPage -or $savedPage.status -ne 200) { throw 'A successful saved source is required for local inspection.' }
      $record.status = $savedPage.status
      $record.finalUrl = $savedPage.finalUrl
      $record.redirects = @($savedPage.redirects)
      $html = Get-Content -LiteralPath (Join-Path $destination $filename) -Raw
    } else {
      $currentUri = [Uri]$url
      $redirects = [System.Collections.Generic.List[object]]::new()
      for ($hop = 0; $hop -lt 6; $hop++) {
        if ($currentUri.Scheme -ne 'https' -or $currentUri.Host -ne 'www.astronmembers.com.br') { throw 'Redirect outside the authorized public host: ' + $currentUri.AbsoluteUri }
        $response = $client.GetAsync($currentUri).GetAwaiter().GetResult()
        $status = [int]$response.StatusCode
        if ($status -in @(301, 302, 303, 307, 308) -and $response.Headers.Location) {
          $nextUri = [Uri]::new($currentUri, $response.Headers.Location)
          $redirects.Add([ordered]@{ url = $currentUri.AbsoluteUri; status = $status; location = $nextUri.AbsoluteUri })
          $response.Dispose()
          $currentUri = $nextUri
          continue
        }
        break
      }
      $record.redirects = @($redirects)
      $record.finalUrl = $currentUri.AbsoluteUri
      $record.status = [int]$response.StatusCode
      $html = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
      $response.Dispose()
      [System.IO.File]::WriteAllText((Join-Path $destination $filename), $html, [System.Text.UTF8Encoding]::new($false))
    }
    $title = [regex]::Match($html, '<title\b[^>]*>([\s\S]*?)</title>', 'IgnoreCase')
    if ($title.Success) { $record.title = Get-PlainText $title.Groups[1].Value }
    $record.h1 = @([regex]::Matches($html, '<h1\b[^>]*>([\s\S]*?)</h1>', 'IgnoreCase') | ForEach-Object { Get-PlainText $_.Groups[1].Value })
    $body = [regex]::Match($html, '<body\b([^>]*)>', 'IgnoreCase')
    if ($body.Success) { $record.bodyClasses = Get-AttributeValue $body.Groups[1].Value 'class' }
    $scripts = [System.Collections.Generic.List[string]]::new()
    $inlineScripts = [System.Collections.Generic.List[object]]::new()
    $scriptIndex = 0
    foreach ($script in [regex]::Matches($html, '<script\b([^>]*)>([\s\S]*?)</script>', 'IgnoreCase')) {
      $scriptIndex++
      $source = Get-AttributeValue $script.Groups[1].Value 'src'
      if ($source) { $scripts.Add($source); continue }
      $code = $script.Groups[2].Value.Trim()
      if (!$code) { continue }
      $isTracking = $code -match '\b(gtag|dataLayer|fbq|hotjar|hj|clarity|ga|gtm|oaiq)\b|GTM-|googletagmanager|google-analytics|connect\.facebook\.net|pixelId|cloudflareinsights'
      $isUi = $code -match 'addEventListener|querySelector|showModal|IntersectionObserver|classList|requestAnimationFrame|scrollIntoView'
      $type = Get-AttributeValue $script.Groups[1].Value 'type'
      $category = if ($isTracking -and $isUi) { 'tracking-and-ui' } elseif ($isTracking) { 'tracking' } elseif ($isUi) { 'ui' } elseif ($type -eq 'application/ld+json') { 'structured-data' } else { 'configuration-or-other' }
      $line = ($html.Substring(0, $script.Index).Split("`n")).Length
      $inlineScripts.Add([ordered]@{ index = $scriptIndex; line = $line; characters = $code.Length; type = $type; category = $category; excerpt = ($code -replace '\s+', ' ').Substring(0, [Math]::Min(140, ($code -replace '\s+', ' ').Length)) })
    }
    $record.scripts = @($scripts | Sort-Object -Unique)
    $record.inlineScripts = @($inlineScripts)
    $record.stylesheets = @([regex]::Matches($html, '<link\b([^>]*)>', 'IgnoreCase') | ForEach-Object {
      $attributes = $_.Groups[1].Value
      if ((Get-AttributeValue $attributes 'rel') -match '(^|\s)stylesheet(\s|$)') { Get-AttributeValue $attributes 'href' }
    } | Where-Object { $_ } | Sort-Object -Unique)
    $imageReferences = @([regex]::Matches($html, '<img\b([^>]*)>', 'IgnoreCase') | ForEach-Object {
      Get-AttributeValue $_.Groups[1].Value 'src'
      Get-AttributeValue $_.Groups[1].Value 'data-src'
      Get-AttributeValue $_.Groups[1].Value 'srcset'
    })
    $imageReferences += @([regex]::Matches($html, '["''(]((?:(?:https?:)?//[^"''<>()\s]+|(?:\.\.?/)?images/[^"''<>()\s]+)\.(?:png|jpe?g|webp|svg|gif|avif)(?:\?[^"''<>()\s]*)?)["'')]', 'IgnoreCase') | ForEach-Object { $_.Groups[1].Value })
    $record.images = @($imageReferences | Where-Object { $_ } | Sort-Object -Unique)
    Write-Output ($record.status.ToString() + ' ' + $path + ' | scripts=' + $record.scripts.Count + ' css=' + $record.stylesheets.Count + ' images=' + $record.images.Count + ' inline=' + $record.inlineScripts.Count)
  } catch {
    $record.error = $_.Exception.Message
    if ($_.Exception.Response) { $record.status = [int]$_.Exception.Response.StatusCode }
    Write-Output ('FAILED ' + $path + ' | ' + $record.error)
  }
  $inventory.Add([pscustomobject]$record)
}
$client.Dispose()
$handler.Dispose()

$manifest = [ordered]@{
  generatedAtUtc = [DateTime]::UtcNow.ToString('o')
  source = 'Public GET requests to www.astronmembers.com.br only; no media downloads.'
  inlineClassification = 'Keyword-based inspection; categories are hints for source review.'
  pages = @($inventory)
}
[System.IO.File]::WriteAllText((Join-Path $destination 'inventory.json'), ($manifest | ConvertTo-Json -Depth 10), [System.Text.UTF8Encoding]::new($false))
Write-Output ('Saved inventory: ' + $inventory.Count + ' pages.')
