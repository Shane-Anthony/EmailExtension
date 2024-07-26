// PureGarden Email content script
// Extension added to Firefox (could port to Chrome if requested)
// Click extension icon, display a form populated with data from jobModel
// Fields modifiable via pop up form

// init empty job model
var jobModel = {
	type: "Delivery",
	do_number: undefined, // pg no
	order_number: undefined, // customer order no
    customer: undefined,
    email: undefined,
	
};

// scrape job info from page and assign to job model
function pullJobData(){
	let job = Object.assign({}, jobModel);
	

	job.do_number = getDoNumber();

	job.email = getEmail();
	
	job.customer = getJobCustomerName();

	job.order_number = getOrderNumber();

	return job;
}

// scrape PG Number (do_number)
function getDoNumber(){
	try {
		let pg = document.querySelector("#post_job_form .we-page-label-value").innerText;
		return pg;
	} catch(e){
		return undefined;
	}
}

// scrape customer's email address (notify_email)
function getEmail(){
    try {
        let emailElement = document.querySelector("#post_job_form div.full-width.mb24 a[href^='mailto:']");
                
        if (emailElement) {
            let email = emailElement.innerText;
            console.log("Email:", email);
            return email;
        } else {
            console.log("Email element not found");
            return "";
        }
    } catch(e) {
        console.error("Error:", e.message);
        return "";
    }
}

// scrape job customer name (customer)
function getJobCustomerName() {
    try {
        let jobCustomer = document.getElementById("customerName").innerText;
        console.log('Customer:', jobCustomer);
        return jobCustomer;
    } catch (e) { 
        console.error('Error fetching customer name:', e);
        return ""; 
    }   
}


function getOrderNumber(){
    try {
        // Get the order number element
        let orderNumberElement = document.querySelector("#name");

        // Check if the element exists
        if (orderNumberElement) {
            // Extract the order number text
            let orderNumber = orderNumberElement.innerText.trim();

            // Return the extracted order number
            return orderNumber;
        } else {
            // If the element is not found, return an error message
            return "Order number element not found";
        }
    } catch (e) { 
        // If an error occurs during the process, return the error message
        return e.message;
    }
}


// extension messaging event handler
function receiveMessage(message){
	switch(message.command){
		case "getjob":
			var str = JSON.stringify(pullJobData());
			return Promise.resolve({contents: str});
	}
}

// trigger handler on message received
browser.runtime.onMessage.addListener(receiveMessage);