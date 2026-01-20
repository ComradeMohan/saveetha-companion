interface Intent {
  tag: string;
  patterns: string[];
  responses: string[];
}

export const intents: Intent[] = [
    {
      "tag": "greeting",
      "patterns": ["hello", "hi", "hey", "good morning", "good evening"],
      "responses": ["Hello! 👋 How can I help you today?", "Hi there! What can I do for you?"]
    },
    {
      "tag": "about_site",
      "patterns": ["what is this site", "about saveethahub", "tell me about", "what do you do"],
      "responses": [
        "SaveethaHub is an academic tool for Saveetha students with features like CGPA calculator, attendance tracking, concept maps and more."
      ]
    },
    {
      "tag": "contact",
      "patterns": ["contact", "contact us", "how to contact", "phone", "email"],
      "responses": [
        "📞 You can contact SaveethaHub via the Contact page: https://saveethahub.tech/contact. Please fill the form there, and the team will reach you soon."
      ]
    },
    {
      "tag": "cgpa_calculator",
      "patterns": ["cgpa", "calculate cgpa", "cgpa calculator"],
      "responses": [
        "You can calculate your CGPA directly on our site using the CGPA Calculator tool. You can find it on the home page."
      ]
    },
    {
      "tag": "attendance",
      "patterns": ["attendance", "attendance calculator", "track attendance"],
      "responses": [
        "Track and calculate attendance percentage with our Attendance Calculator tool on the home page."
      ]
    },
    {
      "tag": "study_materials",
      "patterns": ["notes", "study materials", "files", "pdf", "concept maps"],
      "responses": [
        "You can access study materials like concept maps in our Concept Map Library on the home page."
      ]
    },
    {
      "tag": "login",
      "patterns": ["login", "sign in", "student login"],
      "responses": [
        "To login, go to the student login page and use your @saveetha.com Google account."
      ]
    },
    {
      "tag": "events",
      "patterns": ["events", "upcoming events", "workshops", "hackathons"],
      "responses": [
        "Check out the Hackathons page for upcoming competitions, or the Calendar page for university events."
      ]
    },
    {
      "tag": "thanks",
      "patterns": ["thanks", "thank you", "thx"],
      "responses": ["You’re welcome! 😊", "Anytime!", "Glad I could help!"]
    },
    {
      "tag": "fallback",
      "patterns": ["*"],
      "responses": [
        "Sorry, I didn't understand that. Can you rephrase?",
        "I’m not sure about that. Try asking something else!",
        "I can help with questions about SaveethaHub features, like calculators, events, and contact info."
      ]
    }
  ];
