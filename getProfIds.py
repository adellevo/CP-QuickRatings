import requests
import re
import csv
from bs4 import BeautifulSoup

def getHTML(url):
    r = requests.get(url)
    return r.text

html = getHTML('https://www.polyratings.com/list.html')
parsed_html = BeautifulSoup(html, 'html.parser')

# header = ['professor_name', 'professor_id']
csv_file = open('profIds.csv', 'w', newline='')
csv_writer = csv.writer(csv_file)

for link in parsed_html.find_all('a', attrs={'href': re.compile("^/eval/")}):
    professor_name = link.get('data-search')
    # m = re.search(re.search(r'^([^A-Z]*[A-Z]){2}', professor_name)
    # print(m.span()[1])
    professor_id = link.get('href').split('/')[2]
    # print(professor_name + ', ' + professor_id)
    
    if professor_name.isalpha(): # need to come up with better filter
        data = [professor_name, professor_id]
        csv_writer.writerow(data)
    else:
        print(professor_name)


