// Grabbing the form and building elements from the HTML
const userInput = document.querySelector(".user_input");
const userForm = document.getElementById("user_form");
const building = document.querySelector(".building");

let totalLifts = 0;
let totalFloors = 0;
let pendingRequests = [];
let liftStatus = []; // Track the status of each lift (moving or not)
let floorLiftCount = {}; // Track how many lifts are on each floor

userForm.addEventListener("submit", validateUserForm);

function validateUserForm(event) {
  event.preventDefault();

  const liftCount = +document.querySelector("#totalLifts").value;
  const floorCount = +document.querySelector("#totalFloors").value;

  if (liftCount <= 0) {
    alert("No. of lifts should be greater than 0");
  } else if (floorCount <= 0) {
    alert("No. of Floors should be greater than 0");
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

    upBtn.addEventListener("click", handleButtonClick);
    downBtn.addEventListener("click", handleButtonClick);

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

    liftStatus.push(false); // All lifts are initially not moving
  }

  firstFloor.append(liftContainer); // Append the container to the first floor
}

// Handle button clicks for both up and down buttons
function handleButtonClick(event) {
  const button = event.target;
  const floor = +button.getAttribute("floor-id");

  // Disable the button to prevent further clicks
  button.disabled = true;

  // Check if there are already 2 lifts on the floor
  if (floorLiftCount[floor] < 2) {
    const availableLift = findNearestAvailableLift(floor);
    if (availableLift) {
      moveLift(availableLift, floor, button);
    } else {
      pendingRequests.push({ floor, button }); // If no lift is available, add the request to the pending queue
    }
  }
}

function findNearestAvailableLift(destinationFloor) {
  const lifts = document.querySelectorAll(".lift");
  let nearestLift = null;
  let minDistance = Infinity;

  lifts.forEach((lift, index) => {
    if (!liftStatus[index]) { // Only consider lifts that are not moving
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

function moveLift(liftInfo, destinationFloor, button) {
  const { liftElement, liftId } = liftInfo;
  const currentFloor = Math.abs(parseInt(liftElement.style.transform.split("(")[1]) || 0) / 8 + 1;
  const floorsToMove = Math.abs(destinationFloor - currentFloor);

  const transitionTime = floorsToMove * 2;
  const height = -(destinationFloor - 1) * 8.13;

  // Mark the lift as moving
  liftStatus[liftId] = true;
  floorLiftCount[destinationFloor]++; // Increment the lift count on the destination floor

  liftElement.style.transition = `all linear ${transitionTime}s `;
  liftElement.style.transform = `translateY(${height}rem)`;

  setTimeout(() => {
    openLiftDoors(liftElement);

    setTimeout(() => {
      closeLiftDoors(liftElement);

      setTimeout(() => {
        // After lift completes the task, re-enable the button
        button.disabled = false;
        liftStatus[liftId] = false; // Lift is now available
        floorLiftCount[destinationFloor]--; // Decrease lift count

        // Check if there are pending requests
        if (pendingRequests.length > 0) {
          const nextRequest = pendingRequests.shift();
          moveLift(findNearestAvailableLift(nextRequest.floor), nextRequest.floor, nextRequest.button);
        }
      }, 2500); // Wait 2.5 seconds before the lift is available again
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
