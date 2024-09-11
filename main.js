// Grabbing the form and building elements from the HTML
const userInput = document.querySelector(".user_input");
const userForm = document.getElementById("user_form");
const building = document.querySelector(".building");

let totalLifts = 0;
let totalFloors = 0;
let pendingFloors = [];
let isLiftMoving = [];
let floorLiftCount = {}; // To keep track of how many lifts are present on each floor

userForm.addEventListener("submit", validateUserForm);

function validateUserForm(event) {
  event.preventDefault();

  const liftCount = +document.querySelector("#totalLifts").value;
  const floorCount = +document.querySelector("#totalFloors").value;

  if (liftCount <= 0) {
    alert("No. of lifts should be greater than 0");
  } else if (floorCount <= 0) {
    alert("No. of Floors should be greater than 0");
  } else if (floorCount > 9999) {
    alert("App will crash if the no. of floors is more than 9999");
  } else if (liftCount > floorCount) {
    alert("No. of lifts should be lesser than or equal to No. of Floors");
  } else {
    building.innerHTML = "";
    totalFloors = floorCount;
    totalLifts = liftCount;

    userInput.style.display = "none";

    generateFloors();
    generateLifts();
  }
}

function generateFloors() {
  for (let i = totalFloors; i >= 1; i--) {
    const floorDiv = document.createElement("div");
    const btnsDiv = document.createElement("div");
    const upBtn = document.createElement("button");
    const downBtn = document.createElement("button");

    floorDiv.className = `floor_container`;
    floorDiv.textContent = `Floor ${i}`;
    btnsDiv.className = `floor_btns-container`;

    upBtn.className = `btn`;
    upBtn.textContent = "UP";

    downBtn.className = `btn`;
    downBtn.textContent = "DOWN";

    upBtn.addEventListener("click", buttonClickHandler);
    downBtn.addEventListener("click", buttonClickHandler);

    if (i === totalFloors) {
      upBtn.style.display = 'none';
    } else if (i === 1) {
      downBtn.style.display = 'none';
    }

    floorDiv.setAttribute("floor-id", i);
    upBtn.setAttribute("floor-id", i);
    downBtn.setAttribute("floor-id", i);

    btnsDiv.append(upBtn, downBtn);
    floorDiv.append(btnsDiv);
    building.append(floorDiv);

    // Initialize floorLiftCount with 0 lifts for each floor
    floorLiftCount[i] = 0;
  }
}
function generateLifts() {
  const firstFloor = document.querySelector('[floor-id="1"]');
  const liftContainer = document.createElement("div");
  liftContainer.className = "lift-container";

  const containerWidth = totalLifts * 5.5; // Adjust this factor based on lift width
  liftContainer.style.width = `${containerWidth}rem`; // Dynamically set width based on lift count

  for (let i = 0; i < totalLifts; i++) {
    let lift = document.createElement("div");
    lift.className = "lift";
    lift.id = `lift${i}`;

    const liftDoors = document.createElement("div");
    liftDoors.className = "lift_doors-container";
    const leftDoor = document.createElement("div");
    const rightDoor = document.createElement("div");

    leftDoor.className = "left-door";
    rightDoor.className = "right-door";
    liftDoors.append(leftDoor, rightDoor);
    lift.append(liftDoors);

    liftContainer.append(lift);
  }

  firstFloor.append(liftContainer); // Append the container to the first floor
}


// This function will handle button clicks for both up and down buttons
function buttonClickHandler(event) {
  const element = event.target; // The button that was clicked
  const destinationFloor = Number(element.getAttribute("floor-id")); // Get the floor number where the button was clicked

  // Check if the button is currently processing a request
  if (element.getAttribute("processing")) {
    return; // If a request is being processed, ignore further clicks
  }

  // Restrict to only two lifts per floor
  if (floorLiftCount[destinationFloor] >= 2) {
    
    return; // If there are already 2 lifts on this floor, ignore further requests
  }

  element.setAttribute("processing", "true"); // Mark the button as being processed

  // Process the request
  const availableLift = getAvailableLift(destinationFloor);
  if (availableLift) {
    moveLift(availableLift, destinationFloor);
  } else {
    pendingFloors.push(destinationFloor); // If no lifts are available, add to pending queue
  }

  // Wait for 2 seconds before allowing the button to process another request
  setTimeout(() => {
    element.removeAttribute("processing"); // Allow new requests after 2 seconds
  }, 2000); // 2000 milliseconds = 2 seconds
}

function getAvailableLift(destinationFloor) {
  const allLiftElements = document.querySelectorAll(".lift");
  let nearestLift = null;
  let minDistance = Infinity;

  allLiftElements.forEach((lift, index) => {
    if (!isLiftMoving[index]) { // Only consider lifts that are not busy
      const currentFloor = Math.abs(parseInt(lift.style.transform.split("(")[1]) || 0) / 10 + 1;
      const distance = Math.abs(destinationFloor - currentFloor);

      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = { liftElement: lift, liftId: index };
      }
    }
  });

  return nearestLift;
}

function moveLift(liftInfo, destinationFloor) {
  const { liftElement, liftId } = liftInfo;
  const currentFloor = Math.abs(parseInt(liftElement.style.transform.split("(")[1]) || 0) / 8 + 1;
  const floorsToMove = Math.abs(destinationFloor - currentFloor);

  const transitionTime = floorsToMove * 2;
  const height = -(destinationFloor - 1) * 8.13;

  // Mark the lift as busy
  isLiftMoving[liftId] = true;
  floorLiftCount[destinationFloor]++; // Increment lift count on the destination floor

  liftElement.style.transition = `all linear ${transitionTime}s `;
  liftElement.style.transform = `translateY(${height}rem)`;

  setTimeout(() => {
    openLiftDoors(liftElement); // Open the doors after reaching the destination

    setTimeout(() => {
      closeLiftDoors(liftElement); // Close the doors after opening

      setTimeout(() => {
        if (pendingFloors.length > 0) {
          const nextFloor = pendingFloors.shift();
          moveLift(liftInfo, nextFloor); // Move to the next pending request if any
        } else {
          isLiftMoving[liftId] = false; // Mark the lift as available after operation
          floorLiftCount[destinationFloor]--; // Decrement lift count after the lift leaves
        }
      }, 2500); // Wait for 2.5 seconds after closing the doors
    }, 2500); // Keep the doors open for 2.5 seconds
  }, transitionTime * 1000); // Wait for the lift to finish moving
}

function openLiftDoors(liftElement) {
  const liftDoors = liftElement.querySelector(".lift_doors-container");
  liftDoors.classList.add("openLift");
  liftDoors.classList.remove("closeLift");
}

function closeLiftDoors(liftElement) {
  const liftDoors = liftElement.querySelector(".lift_doors-container");
  liftDoors.classList.add("closeLift");
  liftDoors.classList.remove("openLift");
}
