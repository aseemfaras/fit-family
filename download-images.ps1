# Download images to public/images folder
$images = @{
    "chyawanprash.jpg" = "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=600&auto=format&fit=crop"
    "triphala.jpg" = "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&auto=format&fit=crop"
    "ashwagandha.jpg" = "https://images.unsplash.com/photo-1611079830811-865ec4466c97?q=80&w=600&auto=format&fit=crop"
    "turmeric.jpg" = "https://images.unsplash.com/photo-1615485925763-867862f80029?q=80&w=600&auto=format&fit=crop"
    "hair-oil.jpg" = "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?q=80&w=600&auto=format&fit=crop"
    "cough-syrup.jpg" = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop"
    "digestive.jpg" = "https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=600&auto=format&fit=crop"
    "musli.jpg" = "https://images.unsplash.com/photo-1564518088031-6287f3b6167c?q=80&w=600&auto=format&fit=crop"
    "neem-soap.jpg" = "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=600&auto=format&fit=crop"
    "pain-oil.jpg" = "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=600&auto=format&fit=crop"
    "foot-massage.jpg" = "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=600&auto=format&fit=crop"
    "head-massage.jpg" = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=600&auto=format&fit=crop"
    "back-chair.jpg" = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop"
    "steam-kit.jpg" = "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop"
}

$destDir = "public/images"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

foreach ($name in $images.Keys) {
    $url = $images[$name]
    $output = Join-Path $destDir $name
    Write-Host "Downloading $name..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $output
    } catch {
        Write-Host "Failed to download $name"
    }
}
Write-Host "Download complete."
