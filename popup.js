// PureGarden Text Popup script
// extension functions
// get active tab, send message to content scripts, report errors

function getJobData(){
    console.log("Getting job data...");
	// request data from content script
	browser.tabs.query({active: true, currentWindow: true}).then(sendMessage).catch(onError);
}

// send message to content script and receive job data
function sendMessage(tabs){
    console.log("Sending message...");
	browser.tabs.sendMessage(tabs[0].id, {command: "getjob"}).then(handleResponse).catch(onError);
}

function onError(error){
	console.log(error);
}

// parse job data and populate popup form
function handleResponse(response){
    console.log("Handling response...");
	var job = JSON.parse(response.contents);
	populatePopup(job);

      // Remove any existing click event listener to prevent multiple bindings
    document.getElementById("sendEmailButton").removeEventListener("click", sendJobToEmail);

    // Add click event listener to send email only once
    document.getElementById("sendEmailButton").addEventListener("click", function() {
        sendJobToEmail(job);
    });
}

// fill popup form with job data
function populatePopup(job) {
    console.log("Populating popup with job data...");
    getEmailSecret();
    document.getElementById("main").classList.remove("hidden");
    document.getElementById("title").innerText = job.do_number;
    
    
    document.getElementById("email").value = job.email;
  
    const emailContentElement = document.getElementById("emailContent");
    emailContentElement.innerHTML = '';

    // Create email content safely
    const emailContent = document.createElement('div');
    emailContent.innerHTML = `
        <p>Hello,</p>
        <p>I am emailing you with respect to the assembly of your new garden building. We are the assembly partner who has been assigned by ${job.customer}.</p>
        <p>In order to schedule your assembly once your delivery arrives, we require confirmation that your base meets all of the listed requirements and must be submitted via our online form. <strong>This can be accessed here:</strong> <a href="https://service-team.co.uk/base-declaration/">Base Declaration Form</a>. Your unique reference number is <strong>${job.do_number}</strong></p>
        <p>Please note: We will need this completed prior to scheduling the assembly of your new garden building. <strong><u>A delay in completing this, may result in a delay with your assembly.</u></strong></p>
        <p>For garden building assemblies please ensure the following:</p>
        <ul>
            <li>A suitable base or base location, built in accordance with the manufacturers guidelines which must be flat, level, and hard standing.</li>
            <li>Clear and safe access is available around the build area. (60cm)</li>
            <li>The area to be worked in is clear from any debris, animal waste, rubbish and that manholes are suitably covered.</li>
        </ul>
        <p>Any base, other than one built to the specification of the manufacturer, should be regarded as unsuitable for your garden building and assembly will take place on that understanding.</p>
        <p><strong>Important:</strong> Although we will do our best to work with you in ensuring everything is suitable prior to our team's arrival, this is not a project managed service, and should we arrive and discover the base location and or area is insufficient for the works being carried out, then you may be charged in full, but the assembly may not go ahead. We don't want this for you, which is why we gather this information, however it's not a replacement for a site survey because there are just some things, we can't ascertain with images alone.</p>
        <p>For full details please ensure you read: <a href="https://docs.google.com/document/d/1m8MicRhzdApV7aE_GWK8g0ghrjd9z8yM/">Service Team Terms and Conditions</a></p>
        <p>Please note: Packaging removal is not included in this service unless we have specifically been instructed by the manufacturer or retailer. Please confirm the details with your retailer.</p>
        <p>If we are not bringing your new garden building with us, prior to our team's arrival please check for missing and damage parts using the parts list provided. If this is unavailable, it can be obtained from your retailer. Please ensure any damaged and missing parts are logged with your retailer ASAP, failure to do so may result in a delay with your assembly.</p>
        <p>Once you have completed our online declaration form and uploaded base images, we will aim to have your assembly booked and completed within 1-2 weeks. You do not need to do anything after this as when we have a confirmed assembly date a member of the team will be in contact.</p>
        <p>Kind Regards,<br/>Service Team</p>
    `;
    
    // Append created elements
    const img = document.createElement('img');
    img.src = "https://service-team.co.uk/serviceteam/";
    img.alt = "Service Team Logo";
    img.style.width = "auto";
    img.style.height = "auto";
    emailContent.appendChild(img);
    emailContentElement.appendChild(emailContent);
}



function sendJobToEmail(job) {
    console.log("Preparing to send job to email...");
    
    const pgNumber = job.do_number;
    
    const mailjetAPIKey = '94367b93f3c842778208f721327e5d68';
    const mailjetAPISecret = document.getElementById("emailSecret").value;
     if (mailjetAPISecret === undefined || mailjetAPISecret === "" || mailjetAPISecret === "undefined") {
        showEmailSecretField();
        return;
    }
	setEmailSecret();

    const subject = `Assembly of your new garden building ${pgNumber}`;
    const body = document.getElementById("emailContent").innerHTML;
    const email = document.getElementById("email").value;

    // Send message to background script
    const message = {
        type: "sendJobToEmail",
        mailjetAPIKey: '94367b93f3c842778208f721327e5d68',
        mailjetAPISecret: mailjetAPISecret,
        toEmail: email,
        subject: subject,
        body: body
    };

    browser.runtime.sendMessage(message)
    .then(response => {
        console.log("Response from background script:", response);
        if (response.success) {
            alert('Email sent successfully!');
        } else {
            alert(`Error sending email: ${response.error}`);
            console.log(`Error sending email: ${response.error}`)
        }
    })
    .catch(error => {
        console.error("Error sending message to background script:", error);
        alert('Error sending email');
    });
}


// populate job model from form data and return
function getJobModel(){
	var job = {};

	let pgno = document.getElementById("pgno").value;
	job.do_number = pgno;

	let orderno = document.getElementById("orderno").value;
	job.order_number = orderno;

	let cust = document.getElementById("customer").value;
	job.customer = cust;

	let email = document.getElementById("email").value;
	job.email = email;

	return job;
}


// show input field for API key
function showEmailSecretField(){
    console.log("Showing email secret field...");
	document.getElementById("emailSecret").value = "";
	document.getElementById("emailSecret").classList.remove("hidden");

    const row = emailSecret.parentElement;
    row.style.marginBottom = "20px"; // Adjust margin bottom when API secret input is displayed
   
    const input = row.querySelector("input");
    input.style.marginTop = "4px"; // Adjust margin top for input when API secret input is displayed
    input.style.padding = "5px"; // Add padding for input when API secret input is displayed
}

// gets API key input value and stores it locally to the browser
function setEmailSecret(){
    console.log("Setting email secret...");
	var val = document.getElementById("emailSecret").value;
	browser.storage.local.set({"emailSecret": val});
}

// gets API key from local browser storage and updates the "hidden" input field
function getEmailSecret(){
    console.log("Getting email password...");
	browser.storage.local.get("emailSecret").then(function(val){ document.getElementById("emailSecret").value = val.emailSecret; });
}






// get job data on popup load
getJobData();