/* ============================================================
   Harjasdeep Singh — Retro Macintosh Portfolio Javascript
   Manages draggable windows, themes, dithering, and screensaver.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Systems
  initClock();
  initThemeAndScanlines();
  initWindows();
  initDithering();
  initScreensaver();
});

/* ============================================================
   1. SYSTEM CLOCK
   ============================================================ */
function initClock() {
  const clockEl = document.getElementById("menu-clock");
  if (!clockEl) return;
  
  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  updateClock();
  setInterval(updateClock, 1000);
}

/* ============================================================
   2. THEME & SCANLINE MANAGEMENT
   ============================================================ */
let originalProfileImage = null; // Store original image data for re-dithering

function initThemeAndScanlines() {
  // Load saved preference or default to Green CRT
  let theme = localStorage.getItem("retro-theme") || "green";
  let scanlines = localStorage.getItem("retro-scanlines") !== "false"; // default true
  
  setTheme(theme);
  setScanlines(scanlines);
  
  // Bind Theme Selection Click Events
  document.querySelectorAll(".theme-select").forEach(el => {
    // Set active link visually on load
    const themeName = el.getAttribute("data-theme-name") || el.textContent.toLowerCase().includes("amber") ? "amber" : el.textContent.toLowerCase().includes("classic") ? "classic" : "green";
    el.setAttribute("data-theme-name", themeName);
    
    if (themeName === theme) el.classList.add("active");
    else el.classList.remove("active");
    
    el.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelectorAll(".theme-select").forEach(item => item.classList.remove("active"));
      el.classList.add("active");
      
      const targetTheme = el.getAttribute("data-theme-name");
      setTheme(targetTheme);
    });
  });
  
  // Bind Scanlines Toggle Click Event
  const scanlinesBtn = document.getElementById("menu-toggle-scanlines");
  if (scanlinesBtn) {
    const updateScanlineButtonText = (active) => {
      scanlinesBtn.textContent = active ? "Disable Scanlines" : "Enable Scanlines";
    };
    updateScanlineButtonText(scanlines);
    
    scanlinesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const current = document.body.classList.contains("crt-active");
      const next = !current;
      setScanlines(next);
      updateScanlineButtonText(next);
    });
  }
}

function setTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("retro-theme", theme);
  // Re-dither image to match theme color
  if (originalProfileImage) {
    applyDither(originalProfileImage);
  }
}

function setScanlines(active) {
  if (active) {
    document.body.classList.add("crt-active");
    const overlay = document.querySelector(".crt-overlay");
    if (overlay) overlay.style.opacity = "";
  } else {
    document.body.classList.remove("crt-active");
    const overlay = document.querySelector(".crt-overlay");
    if (overlay) overlay.style.opacity = "0";
  }
  localStorage.setItem("retro-scanlines", active);
}

/* ============================================================
   3. WINDOW MANAGEMENT (Drag, Drop, Focus, Close, Launch)
   ============================================================ */
let activeZIndex = 100;

function initWindows() {
  const windows = document.querySelectorAll(".mac-window:not(.dialog-box)");
  const desktop = document.getElementById("desktop");
  
  // Position windows randomly/tiled on desktop load to avoid stacking
  const isDesktopViewport = window.innerWidth > 800;
  if (isDesktopViewport) {
    const defaultPositions = {
      "window-about": { top: 60, left: 60 },
      "window-projects": { top: 100, left: 340 },
      "window-experience": { top: 320, left: 80 },
      "window-skills": { top: 160, left: 740 },
      "window-contact": { top: 400, left: 600 }
    };

    windows.forEach(win => {
      const id = win.id;
      const pos = defaultPositions[id] || { top: 100, left: 100 };
      
      // Ensure positioning doesn't place windows off-screen on smaller desktop monitors
      const maxLeft = window.innerWidth - win.offsetWidth - 20;
      const maxTop = window.innerHeight - win.offsetHeight - 50;
      
      win.style.top = Math.max(40, Math.min(pos.top, maxTop > 40 ? maxTop : 40)) + "px";
      win.style.left = Math.max(20, Math.min(pos.left, maxLeft > 20 ? maxLeft : 20)) + "px";
    });
  }

  // Focus Window helper
  const focusWindow = (win) => {
    windows.forEach(w => w.classList.remove("active"));
    win.classList.add("active");
    activeZIndex += 2;
    win.style.zIndex = activeZIndex;
  };

  // Window Focus on Click
  windows.forEach(win => {
    win.addEventListener("mousedown", () => {
      focusWindow(win);
    });
  });

  // Make Titlebar Draggable
  windows.forEach(win => {
    const titlebar = win.querySelector(".mac-titlebar");
    if (!titlebar) return;
    
    titlebar.addEventListener("mousedown", (e) => {
      // Don't drag if close button clicked
      if (e.target.classList.contains("mac-close-btn")) return;
      if (window.innerWidth <= 800) return; // Disable drag on mobile

      e.preventDefault();
      focusWindow(win);
      
      let startX = e.clientX;
      let startY = e.clientY;
      let startLeft = parseInt(win.style.left, 10) || win.offsetLeft;
      let startTop = parseInt(win.style.top, 10) || win.offsetTop;
      
      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        // Calculate new position
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Keep titlebar on screen
        const minVisible = 40;
        newLeft = Math.max(-win.offsetWidth + minVisible, Math.min(newLeft, window.innerWidth - minVisible));
        newTop = Math.max(24, Math.min(newTop, window.innerHeight - minVisible)); // 24px is menu bar height
        
        win.style.left = newLeft + "px";
        win.style.top = newTop + "px";
      };
      
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });

  // Handle Close Button Click
  windows.forEach(win => {
    const closeBtn = win.querySelector(".mac-close-btn");
    if (!closeBtn) return;
    
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      win.classList.add("minimized");
      
      // Deselect desktop icons
      document.querySelectorAll(".desktop-icon").forEach(icon => {
        if (icon.getAttribute("data-target") === win.id) {
          icon.classList.remove("selected");
        }
      });
    });
  });

  // Handle Desktop Icons Click & Launch
  const icons = document.querySelectorAll(".desktop-icon");
  icons.forEach(icon => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      icons.forEach(i => i.classList.remove("selected"));
      icon.classList.add("selected");
      
      // Single click highlights. To open, click again or double click.
      const targetId = icon.getAttribute("data-target");
      const targetWin = document.getElementById(targetId);
      if (targetWin) {
        if (targetWin.classList.contains("minimized")) {
          targetWin.classList.remove("minimized");
        }
        focusWindow(targetWin);
      }
    });

    icon.addEventListener("dblclick", (e) => {
      e.preventDefault();
      const targetId = icon.getAttribute("data-target");
      const targetWin = document.getElementById(targetId);
      if (targetWin) {
        targetWin.classList.remove("minimized");
        focusWindow(targetWin);
      }
    });
  });
  
  // Close dialog buttons
  const aboutDialog = document.getElementById("about-dialog");
  const aboutTrigger = document.getElementById("menu-about-trigger");
  const closeAboutBtn = document.getElementById("close-about-dialog");
  
  if (aboutTrigger && aboutDialog) {
    aboutTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      aboutDialog.style.display = "block";
    });
  }
  if (closeAboutBtn && aboutDialog) {
    closeAboutBtn.addEventListener("click", () => {
      aboutDialog.style.display = "none";
    });
  }

  // Click on desktop to deselect icons
  document.addEventListener("click", () => {
    icons.forEach(i => i.classList.remove("selected"));
  });

  // Reset positions menu item
  const resetBtn = document.getElementById("menu-reset-windows");
  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      windows.forEach(w => w.classList.remove("minimized"));
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width > 800) {
        const resetPositions = {
          "window-about": { top: 60, left: 60 },
          "window-projects": { top: 100, left: 340 },
          "window-experience": { top: 320, left: 80 },
          "window-skills": { top: 160, left: 740 },
          "window-contact": { top: 400, left: 600 }
        };
        windows.forEach(win => {
          const pos = resetPositions[win.id] || { top: 100, left: 100 };
          win.style.top = pos.top + "px";
          win.style.left = pos.left + "px";
          focusWindow(win);
        });
      }
    });
  }

  // Support link triggers that open windows (like 'View projects')
  document.querySelectorAll(".nav-window-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetWin = document.getElementById(targetId);
      if (targetWin) {
        targetWin.classList.remove("minimized");
        focusWindow(targetWin);
        
        // Scroll to it on mobile, or center it on desktop
        if (window.innerWidth <= 800) {
          targetWin.scrollIntoView({ behavior: "smooth" });
        }
      }
    });
  });
}

/* ============================================================
   4. DYNAMIC PROFILE PHOTO 1-BIT DITHERING
   ============================================================ */
function initDithering() {
  const img = document.querySelector(".hero-photo");
  if (!img) return;

  // Skip dithering and canvas filters for pre-made pixel art avatar.png to keep its original colors
  if (img.src.includes("avatar.png")) {
    return;
  }

  // Once image loads, grab original data and dither it
  if (img.complete) {
    processImage(img);
  } else {
    img.addEventListener("load", () => {
      processImage(img);
    });
  }
}

function processImage(imgEl) {
  // Draw to offscreen canvas to extract pixel data
  const originalWidth = imgEl.naturalWidth || imgEl.width;
  const originalHeight = imgEl.naturalHeight || imgEl.height;
  
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  // Downscale image to pixel art resolution (160x160)
  const targetSize = 160;
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  ctx.drawImage(imgEl, 0, 0, targetSize, targetSize);
  
  try {
    originalProfileImage = ctx.getImageData(0, 0, targetSize, targetSize);
    applyDither(originalProfileImage);
  } catch (err) {
    console.error("Canvas image dithering failed due to CORS or other error. Falling back.", err);
  }
}

function applyDither(imageData) {
  const imgEl = document.querySelector(".hero-photo");
  if (!imgEl) return;
  
  const width = imageData.width;
  const height = imageData.height;
  
  // Create output canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  // Create workspace image copy
  const workData = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
  const data = workData.data;
  
  // Define active theme colors
  const activeTheme = document.body.getAttribute("data-theme") || "green";
  let fgColor, bgColor;
  
  if (activeTheme === "green") {
    fgColor = [57, 255, 20]; // #39ff14 neon green
    bgColor = [0, 0, 0]; // black
  } else if (activeTheme === "amber") {
    fgColor = [255, 176, 0]; // #ffb000 amber orange
    bgColor = [11, 7, 0]; // deep dark brown-black
  } else {
    fgColor = [0, 0, 0]; // black
    bgColor = [244, 244, 244]; // white
  }
  
  // Check if image has transparent pixels
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 200) {
      hasTransparency = true;
      break;
    }
  }
  
  if (hasTransparency) {
    // For transparent pixel art avatars, do NOT dither. Just tint them!
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Preserve transparent background
      if (a < 50) {
        data[i + 3] = 0;
        continue;
      }
      
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const factor = luma / 255;
      
      if (activeTheme === "classic") {
        // Map to 1-bit black and white
        if (luma > 200) {
          // Light pixels go to white
          data[i] = 244;
          data[i + 1] = 244;
          data[i + 2] = 244;
        } else {
          // Dark pixels go to black
          data[i] = 0;
          data[i + 1] = 0;
          data[i + 2] = 0;
        }
        data[i + 3] = 255;
      } else {
        // Map to CRT green/amber phosphor gradients
        data[i]     = Math.round(bgColor[0] + (fgColor[0] - bgColor[0]) * factor);
        data[i + 1] = Math.round(bgColor[1] + (fgColor[1] - bgColor[1]) * factor);
        data[i + 2] = Math.round(bgColor[2] + (fgColor[2] - bgColor[2]) * factor);
        data[i + 3] = 255;
      }
    }
  } else {
    // Standard ordered dithering for full photos
    const bayerMatrix = [
      [  1,  9,  3, 11 ],
      [ 13,  5, 15,  7 ],
      [  4, 12,  2, 10 ],
      [ 16,  8, 14,  6 ]
    ];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Calculate relative luminance
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Normalize to 0-16
        const threshold = (bayerMatrix[y % 4][x % 4] / 17) * 255;
        
        const color = luma > threshold ? fgColor : bgColor;
        
        data[idx]     = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255; // fully opaque
      }
    }
  }
  
  ctx.putImageData(workData, 0, 0);
  
  // Update photo src dynamically
  imgEl.src = canvas.toDataURL();
}

/* ============================================================
   5. CLASSIC MACINTOSH SCREENSAVER
   ============================================================ */
let screensaverTimer = null;
let screensaverActive = false;
let screensaverAnimationId = null;

// Pixel Maps for Sprite Drawing (1 represents pixel, 0 represents empty)
const sprites = {
  // Smiling Monitor (Generic pixel computer)
  happyMonitor: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0]
  ],
  // Floppy Disk
  floppy: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,1,1,0,0,0,0,1,0,1],
    [1,0,1,0,0,0,0,1,1,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  // Flying Toaster (Frame 1 - wings down)
  toaster1: [
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,1,1,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,1,1,0],
    [1,0,0,0,1,1,1,1,1,1,1,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,1,1,1,1,1,0,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [0,1,1,0,1,1,1,1,1,1,1,0,1,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,1,1,1,0,1,1,1,0,0,0,0]
  ],
  // Flying Toaster (Frame 2 - wings up)
  toaster2: [
    [0,1,1,0,0,1,1,1,1,1,0,0,1,1,0],
    [1,0,0,1,1,0,0,0,0,0,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,1,1,1,1,1,1,1,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,0,1,1,1,1,1,0,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,1,0,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
    [0,1,1,0,1,1,1,1,1,1,1,0,1,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,0,1,1,1,0,1,1,1,0,0,0,0]
  ]
};

function initScreensaver() {
  const canvas = document.getElementById("screensaver-canvas");
  if (!canvas) return;
  
  // Start Idle Timer tracking
  resetIdleTimer();
  
  // Track user input to dismiss screensaver
  const wakeUpEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
  wakeUpEvents.forEach(evt => {
    window.addEventListener(evt, () => {
      if (screensaverActive) {
        stopScreensaver();
      } else {
        resetIdleTimer();
      }
    }, { passive: true });
  });
  
  // Bind menu option
  const menuTrigger = document.getElementById("menu-run-screensaver");
  if (menuTrigger) {
    menuTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      startScreensaver();
    });
  }

  // Handle Resize
  window.addEventListener("resize", () => {
    if (screensaverActive) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
}

function resetIdleTimer() {
  if (screensaverActive) return;
  
  clearTimeout(screensaverTimer);
  // Auto-activate screensaver after 30 seconds of inactivity
  screensaverTimer = setTimeout(() => {
    startScreensaver();
  }, 30000);
}

function startScreensaver() {
  const canvas = document.getElementById("screensaver-canvas");
  if (!canvas) return;
  
  screensaverActive = true;
  canvas.style.display = "block";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Create flying assets
  const items = [];
  const activeTheme = document.body.getAttribute("data-theme") || "green";
  let color = "#39ff14";
  if (activeTheme === "amber") color = "#ffb000";
  if (activeTheme === "classic") color = "#ffffff"; // draw in white on black background screensaver
  
  const spriteTypes = ["happyMonitor", "floppy", "toaster"];
  
  // Add 8-12 floating items
  const itemCount = 10;
  for (let i = 0; i < itemCount; i++) {
    const type = spriteTypes[Math.floor(Math.random() * spriteTypes.length)];
    items.push({
      type: type,
      x: Math.random() * (canvas.width - 100) + 50,
      y: Math.random() * (canvas.height - 100) + 50,
      vx: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 1.5 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
      scale: 3, // pixel scaling
      animFrame: 0,
      animSpeed: 0.15
    });
  }
  
  const ctx = canvas.getContext("2d");
  
  const drawPixelSprite = (spriteData, px, py, scale) => {
    const rows = spriteData.length;
    const cols = spriteData[0].length;
    
    ctx.fillStyle = color;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (spriteData[r][c] === 1) {
          ctx.fillRect(px + c * scale, py + r * scale, scale, scale);
        }
      }
    }
  };
  
  const tick = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw matrix rain or retro grids under the screensaver items
    ctx.fillStyle = "rgba(0, 50, 0, 0.05)";
    if (activeTheme === "amber") ctx.fillStyle = "rgba(50, 25, 0, 0.05)";
    if (activeTheme === "classic") ctx.fillStyle = "rgba(25, 25, 25, 0.05)";
    
    // Update and draw items
    items.forEach(item => {
      item.x += item.vx;
      item.y += item.vy;
      
      let spriteData;
      if (item.type === "happyMonitor") {
        spriteData = sprites.happyMonitor;
      } else if (item.type === "floppy") {
        spriteData = sprites.floppy;
      } else {
        // Toaster animation frames
        item.animFrame += item.animSpeed;
        spriteData = Math.floor(item.animFrame) % 2 === 0 ? sprites.toaster1 : sprites.toaster2;
      }
      
      const sw = spriteData[0].length * item.scale;
      const sh = spriteData.length * item.scale;
      
      // Boundary Collision Bounces
      if (item.x <= 0 || item.x + sw >= canvas.width) {
        item.vx *= -1;
        item.x = Math.max(0, Math.min(item.x, canvas.width - sw));
      }
      if (item.y <= 0 || item.y + sh >= canvas.height) {
        item.vy *= -1;
        item.y = Math.max(0, Math.min(item.y, canvas.height - sh));
      }
      
      drawPixelSprite(spriteData, item.x, item.y, item.scale);
    });
    
    screensaverAnimationId = requestAnimationFrame(tick);
  };
  
  tick();
}

function stopScreensaver() {
  const canvas = document.getElementById("screensaver-canvas");
  if (!canvas) return;
  
  screensaverActive = false;
  canvas.style.display = "none";
  cancelAnimationFrame(screensaverAnimationId);
  resetIdleTimer();
}
