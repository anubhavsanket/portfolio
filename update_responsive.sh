#!/bin/bash
# Update 900px breakpoint
sed -i 's/.experience { padding: 0 24px 80px; }/.experience { padding: 0 24px 80px; }\n    .schedule { padding: 80px 24px; }\n    .schedule-header { flex-direction: column; align-items: flex-start; gap: 20px; }/' C:/Users/Anubhav/Documents/Projects/portfolio/styles.css

# Update 600px breakpoint
sed -i 's/.screenshot-code { font-size: 11px; }/.screenshot-code { font-size: 11px; }\n    .schedule-heading { font-size: 1.8rem; }\n    .schedule-pills { flex-wrap: wrap; }/' C:/Users/Anubhav/Documents/Projects/portfolio/styles.css
