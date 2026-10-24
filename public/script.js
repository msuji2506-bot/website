const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

const popupOverlay = document.getElementById("popupOverlay");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupText = document.getElementById("popupText");
const popupClose = document.getElementById("popupClose");
const popupOk = document.getElementById("popupOk");

function showPopup(title, text, success = true) {
    popupTitle.textContent = title;
    popupText.textContent = text;
    popupIcon.textContent = success ? "✓" : "!";
    popupIcon.style.color = success ? "#53e6b3" : "#ff8299";
    popupIcon.style.borderColor = success ? "#20c99788" : "#ff829988";
    popupIcon.style.background = success ? "#20c99720" : "#ff829920";

    popupOverlay.classList.add("show");
    popupOverlay.setAttribute("aria-hidden", "false");
    popupOk.focus();
}

function closePopup() {
    popupOverlay.classList.remove("show");
    popupOverlay.setAttribute("aria-hidden", "true");
}

popupClose.addEventListener("click", closePopup);
popupOk.addEventListener("click", closePopup);

popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay) {
        closePopup();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closePopup();
    }
});

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const formData = Object.fromEntries(
        new FormData(form).entries()
    );

    submitBtn.disabled = true;
    submitBtn.querySelector("span").textContent = "Submitting...";
    message.textContent = "";

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Registration failed."
            );
        }

        const registrationId =
            data.registrationId ?? data.id;

        let successText =
            "Your registration has been submitted successfully to TechSpire!";

        if (registrationId !== undefined && registrationId !== null) {
            successText += "\nYour Registration ID: " + registrationId;
        }

        showPopup("Registration Successful!", successText, true);

        message.textContent = "You are successfully registered!";
        message.style.color = "#53e6b3";

        form.reset();

    } catch (error) {
        console.error("Registration error:", error);

        showPopup(
            "Registration Failed",
            error.message || "Please check your server and try again.",
            false
        );

        message.textContent = error.message;
        message.style.color = "#ff8299";

    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector("span").textContent =
            "Complete Registration";
    }
});