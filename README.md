# watson-personality-alexa-skill
Code for the AWS Lambda functions that run an Alexa personality analyzer. 

index.js is the Lambda function that is linked to Alexa. What this means is that when a user activates the skill (by saying: Alexa, ask Watson...), this lambda function is called. It uses the AWS SDK to invoke the other lambda function and pass a twitter handle (given by an id on the alexa slot value that is passed to index.js). 

twitterAnalyze.py is the second lambda function. This function is responsible for using the passed twitter handle from index.js, to scrape a twitter feed and gather the last 200 tweets and combine them into one large string. This string is then passed to IBM Watson's Personality Insights API which returns personality traits along with percentages. This data is then trimmed before being returned to index.js.

After index.js recieves the final string of data from twitterAnalyze.py, it then builds and outputs the desired Alexa response.

twitterAnalyze uses a Twitter python wrapper, as well as a Watson library in order to run. 
