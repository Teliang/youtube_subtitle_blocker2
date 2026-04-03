browser.runtime.onMessage.addListener(function (message) {
  console.log("Received message in content script:", message);
  loadDSetting().then(applyAction);
});

async function loadDSetting() {
  const left = await browser.storage.local.get("left");
  const top = await browser.storage.local.get("top");
  const width = await browser.storage.local.get("width");
  const height = await browser.storage.local.get("height");
  return {left:left.left,top:top.top,width:width.width,height:height.height}
}

  function applyAction(settings){
    console.log('setting: ',settings)
      // Remove the existing overlay if there is one
      const existingOverlay = document.getElementById("subtitle-blocker-overlay");
      if (existingOverlay) {
        existingOverlay.remove();
        console.log("Overlay removed successfully.");
        return;
      }
  
      // Create a new overlay
      const overlay = document.createElement("div");
      overlay.id = "subtitle-blocker-overlay";
      overlay.style.position = "fixed"; // Fixed position to cover the viewport
      overlay.style.left = settings.left; // Start at left
      overlay.style.top = settings.top; // Start at top
      overlay.style.width = settings.width || "600px"; // Set width from the popup
      overlay.style.height = settings.height || "50px"; // Set height from the popup
      overlay.style.backgroundColor = "rgba(255, 255, 255, 0.5)"; // Semi-transparent background
      overlay.style.backdropFilter = "blur(5px)"; // Apply blur effect
      overlay.style.zIndex = "9999"; // Ensure it's on top of all other elements
      overlay.style.pointerEvents = "all"; // Allows interaction
      overlay.style.cursor = "move"; // Change cursor to indicate draggable

      overlay.style.resize = "both"; // 
      overlay.style.overflow = "auto"; // 

      // Variables to track mouse movement
      let isDragging = false;
      
      let offsetX, offsetY;
  
      // Mouse down event to start dragging
      overlay.addEventListener("mousedown", (e) => {
        const rect = overlay.getBoundingClientRect();
        const edgeSize = 10; // px threshold

        const isRightEdge = e.clientX > rect.right - edgeSize;
        const isBottomEdge = e.clientY > rect.bottom - edgeSize;

        if (isRightEdge && isBottomEdge) {
          console.log("Resizing (corner)");
        } else {
          console.log("Dragging");
          isDragging = true;
          offsetX = e.clientX - overlay.getBoundingClientRect().left;
          offsetY = e.clientY - overlay.getBoundingClientRect().top;
          overlay.style.cursor = "grabbing"; // Change cursor while dragging
        }
      });
  
      // Mouse move event to drag the overlay
      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          overlay.style.left = e.clientX - offsetX + "px";
          overlay.style.top = e.clientY - offsetY + "px";
        }
      });
  
      // Mouse up event to stop dragging
      document.addEventListener("mouseup", () => {
        isDragging = false;
        overlay.style.cursor = "move"; // Change cursor back
        browser.storage.local.set({ 'left': overlay.style.left,'top':overlay.style.top});
      });

      // observe resize event
      const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;

          if(width>0 && height>0){
            browser.storage.local.set({ 'width': width + "px",'height':height + "px"});
          }
        }
      });
      observer.observe(overlay);
  
      console.log("Attempting to append overlay to YouTube page");

      // Append the overlay to the body
      document.body.appendChild(overlay);
      console.log("Overlay applied successfully.");
  }