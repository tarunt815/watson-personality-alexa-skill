import sys
import os
import requests
import json
import operator
import twitter
from watson_developer_cloud import PersonalityInsightsV2 as PersonalityInsights 

twitter_consumer_key = os.environ['TWITTER_CONSUMER_KEY']
twitter_consumer_secret = os.environ['TWITTER_CONSUMER_SECRET']
twitter_access_token = os.environ['TWITTER_ACCESS_TOKEN']
twitter_access_secret = os.environ['TWITTER_ACCESS_SECRET']

pi_username = os.environ['PERSONALITY_INSIGHTS_USERNAME']
pi_password = os.environ['PERSONALITY_INSIGHTS_PASSWORD']


def watson_handler(event, context):
	#The Twitter handle
	user_handle = event['handle']

	#Analyze the user's tweets using the Watson PI API
	user_result = analyze(user_handle)

	#Flatten the results received from the Watson PI API
	user = flatten(user_result)

	#Sort the results
	sorted_results = sorted(user.items(), key=operator.itemgetter(1), reverse=True)

	# output = {}
	# for x in sorted_results:
	# 	output[x] = user[x]
	
	# print(sorted_results)
	# print (output)
	result = ""

	for x in range(0,4):
		result += sorted_results[x][0] + ", "
	
	result += "and " + sorted_results[5][0]
	return result 	

# Get tweets and feed into watson om nom
def analyze(handle):

	#Invoke Twitter API
	twitter_api = twitter.Api(consumer_key=twitter_consumer_key,
                  consumer_secret=twitter_consumer_secret,
                  access_token_key=twitter_access_token,
                  access_token_secret=twitter_access_secret)

	#Retrieving the last 200 tweets from a user
	statuses = twitter_api.GetUserTimeline(screen_name=handle, count=200, include_rts=False)

	#Putting all 200 tweets into one large string called "text"
	text = "" 
	for s in statuses:
	    if (s.lang =='en'):
    		text += s.text.encode('utf-8')
	
	personality_insights = PersonalityInsights(username=pi_username, password=pi_password)

	#Analyzing the 200 tweets with the Watson PI API
	pi_result = personality_insights.profile(text)

	#Returning the Watson PI API results
	return pi_result

# Flatten Watson data
def flatten(orig):
    data = {}
    for c in orig['tree']['children']:
        if 'children' in c:
            for c2 in c['children']:
                if 'children' in c2:
                    for c3 in c2['children']:
                        if 'children' in c3:
                            for c4 in c3['children']:
                                if (c4['category'] == 'personality'):
                                    data[c4['id']] = c4['percentage']
                                    if 'children' not in c3:
                                        if (c3['category'] == 'personality'):
                                                data[c3['id']] = c3['percentage']
    return data
