from bs4 import BeautifulSoup
import re;
import requests;
import datetime;
import icalendar;
from datetime import datetime;
import pytz
import os.path;
from icalendar import vCalAddress, vText
from icalendar import vDatetime
from icalendar import Calendar, Event
from datetime import timedelta

dayNumber={
'mo':0,
'tu':1,
'we':2,
'th':3,
'fr':4,
'sa':5,
'su':6}

def findData(dataList,subject):
    for data in dataList:
        if(subject in data['subject']):
            return data
    return None

def convert_meeting_days(days):
    i=0;
    dayList = [];
    while i+1<=len(days):
        day = days[i:i+2]
        dayList.append(dayNumber[day.lower()])
        i+=2
    return dayList;
def last_weekday(day,weekday):
    lastday = day - timedelta(days=day.weekday()) + timedelta(days=weekday, weeks=-1)
    return lastday;
def next_weekday(d, weekday):
    days_ahead = weekday - d.weekday()
    if days_ahead <= 0: # Target day already happened this week
        days_ahead += 7
    return d + timedelta(days_ahead)

####################################
#d = datetime.date(2011, 7, 2)
#next_monday = next_weekday(d, 0) # 0 = Monday, 1=Tuesday, 2=Wednesday...
#print(next_monday)
#####################################
fileDirectory = 'enrollment'
if os.path.isfile('../../../'+fileDirectory+'_files/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.html'):
    soup = BeautifulSoup(open('../../../'+fileDirectory+'_files/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.html'))
else:
    soup = BeautifulSoup(open('../../../'+fileDirectory+'_files/SA_LEARNER_SERVICES.SSS_STUDENT_CENTER.htm'))
classes = soup.findAll("span", { "class" : "PSHYPERLINKDISABLED" })
classIds = [];
subjects = [];
for c in classes:
    print "processing:",c
    tempc = c;
    classnumtemp = re.findall(r'\([0-9]+\)',str(c))
    subjecttemp = re.findall(r'\>[A-Z]+',str(c))
    if(len(subjecttemp)>=1):
        if(len(subjecttemp[0])>2):
            subjects.append(subjecttemp[0][1:]);
    if(len(classnumtemp)>=1):
        classnum = classnumtemp[0][1:-1];
        classIds.append(classnum);
print 'class numbers:', classIds;
print 'subject :',subjects;
#classIds = [40613,40615]
#print "skipped original course numbers", "new course number: ",classIds
classesInfo = {};
#creating calendar
cal = Calendar();
i=-1
for classId in classIds:
    i+=1;
    subject = subjects[i];
    data = requests.get('http://vazzak2.ci.northwestern.edu/courses/?class_num='+str(classId))
    classesInfo[classId] = {};
    if(len(data.json())==0):
        print "no information was found for course num ",classId,'\n'
        continue;
    
    classesInfo[classId] = findData(data.json(),subject);
    if(classesInfo[classId] ==None):
        print "no information found for the course num",classId,"in this subject: ",subject;
        continue
    print 'meeting days:',classesInfo[classId]['meeting_days']
    if classesInfo[classId]['meeting_days'] != None:
        classesInfo[classId]['meeting_days'] = convert_meeting_days(classesInfo[classId]['meeting_days'])
    else:
        print 'skipping course_num: ',classId,' because of no meeting_days';
        continue;
    print 'processing course title:',classesInfo[classId]['title']
    for meetDay in classesInfo[classId]['meeting_days']:
        startDate = classesInfo[classId]['start_date']+' 00:00:00';
        startDate = datetime.strptime(startDate, '%Y-%m-%d %H:%M:%S')
        startDate = next_weekday(startDate,meetDay) 
        startDate = startDate.strftime("%Y-%m-%d") 
        startTime = classesInfo[classId]['start_time'];
        if startTime==None:
            print 'course start time not availble. Skipping. Course_num: ',classId
            continue;
        tempStartDate = startDate;
        endTime = classesInfo[classId]['end_time'];
        if endTime==None:
            print 'course end time not availble. Skipping. Course_num: ',classId
            continue;
        endTime = tempStartDate+ ' '+ endTime;
        endTime = datetime.strptime(endTime, '%Y-%m-%d %H:%M:%S')
        startTime = tempStartDate + ' '+startTime;
        startTime = datetime.strptime(startTime, '%Y-%m-%d %H:%M:%S')
        endDate = classesInfo[classId]['end_date']+' 00:00:00';
        endDate = datetime.strptime(endDate, '%Y-%m-%d %H:%M:%S')
        days = (endDate - startTime).days
        print 'startDate:',startTime
        print 'startDateEndTime',endTime
        print 'endDate:',endDate
        print 'days:', days;
        weeks = days/7+1  
        event = Event();
        if(classesInfo[classId]['topic']!=None):
            event.add('summary', classesInfo[classId]['topic']+classesInfo[classId]['title']);
        else:
            event.add('summary',classesInfo[classId]['title']);
        event.add('dtstart',startTime)
        event.add('dtend',endTime)
        event.add('rrule',{'freq':'weekly','count':weeks});
        event.add('location',classesInfo[classId]['room']);
        cal.add_component(event)
        
        
print cal;        
f = open('../../../courses.ics','wb')
f.write(cal.to_ical());
f.close(); 
