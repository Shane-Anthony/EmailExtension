browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "sendJobToEmail") {
        const { mailjetAPIKey, mailjetAPISecret, toEmail, subject, body } = message;

        fetch('https://api.mailjet.com/v3.1/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${mailjetAPIKey}:${mailjetAPISecret}`)
            },
            body: JSON.stringify({
                Messages: [{
                    From: {
                        Email: "no-reply@service-team.co.uk",
                        Name: "Service Team"
                    },
                    To: [{
                        Email: toEmail,
                        Name: toEmail,
                    }],
                    Subject: subject,
                    HTMLPart: body
                }]
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log("Email sent successfully:", data);
            sendResponse({ success: true });
        })
        .catch(error => {
            console.error('Error sending email:', error);
            sendResponse({ success: false, error: error.message });
        });

        // Return true to indicate that sendResponse will be called asynchronously
        return true;
    }
});
