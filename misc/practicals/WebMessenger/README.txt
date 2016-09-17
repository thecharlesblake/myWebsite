To run the application, ssh into your webspace and run the following command:

"node message_agent.js [UI_port_number] [MA_port_number] [hostname]"

for me this looks as follows:

node message_agent.js 20267 30267 cb307

you can then connect to your UI at:

http://<hostname>.host.cs.st-andrews.ac.uk:[UI_port_number]

(note for tutor: if you wish to test this using your own host then you will need to add your details and port numbers to "web2-users.txt")

my practical is stored on my system at:

nginx/practicals/WebMessenger
