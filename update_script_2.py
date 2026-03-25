import sys

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Top Nav Menu
old_nav = """      <div class="nav__links">
        <a href="#about-hero" class="nav__link">About</a>
        <a href="#work" class="nav__link">Projects</a>
        <a href="#rflxns" class="nav__link">RFLXNS</a>
        <a href="#capabilities" class="nav__link">Skills &amp; Technologies</a>
        <a href="#certificates" class="nav__link">Certifications &amp; Courses</a>
        <a href="#experience" class="nav__link">Experience</a>
        <a href="#contact" class="nav__link">Contact</a>
      </div>"""
new_nav = """      <div class="nav__links">
        <a href="#about-hero" class="nav__link">About</a>
        <a href="#capabilities" class="nav__link">Skills</a>
        <a href="#work" class="nav__link">Projects</a>
        <a href="#training" class="nav__link">Training</a>
        <a href="#certificates" class="nav__link">Certifications</a>
        <a href="#education" class="nav__link">Education</a>
        <a href="#contact" class="nav__link">Contact</a>
      </div>"""
if old_nav in html:
    html = html.replace(old_nav, new_nav)
else:
    print("WARNING: Top Nav not found!")

# 2. Update Console Menu
old_console = """              <ul class="console-list">
                <li><a href="#about-hero" class="console-link"><span class="console-item">About</span> <span class="console-num">I</span></a></li>
                <li><a href="#work" class="console-link"><span class="console-item">Projects</span> <span class="console-num">II</span></a></li>
                <li><a href="#rflxns" class="console-link"><span class="console-item">RFLXNS</span> <span class="console-num">III</span></a></li>
                <li><a href="#capabilities" class="console-link"><span class="console-item">Skills &amp; Technologies</span> <span class="console-num">IV</span></a></li>
                <li><a href="#certificates" class="console-link"><span class="console-item">Certifications &amp; Courses</span> <span class="console-num">V</span></a></li>
                <li><a href="#experience" class="console-link"><span class="console-item">Experience</span> <span class="console-num">VI</span></a></li>
                <li><a href="#contact" class="console-link"><span class="console-item">Contact</span> <span class="console-num">VII</span></a></li>
              </ul>"""
new_console = """              <ul class="console-list">
                <li><a href="#about-hero" class="console-link"><span class="console-item">About</span> <span class="console-num">I</span></a></li>
                <li><a href="#capabilities" class="console-link"><span class="console-item">Skills</span> <span class="console-num">II</span></a></li>
                <li><a href="#work" class="console-link"><span class="console-item">Projects</span> <span class="console-num">III</span></a></li>
                <li><a href="#training" class="console-link"><span class="console-item">Training</span> <span class="console-num">IV</span></a></li>
                <li><a href="#certificates" class="console-link"><span class="console-item">Certifications</span> <span class="console-num">V</span></a></li>
                <li><a href="#education" class="console-link"><span class="console-item">Education</span> <span class="console-num">VI</span></a></li>
                <li><a href="#contact" class="console-link"><span class="console-item">Contact</span> <span class="console-num">VII</span></a></li>
              </ul>"""
if old_console in html:
    html = html.replace(old_console, new_console)
else:
    print("WARNING: Console Menu not found!")

# 3. Rename Capabilities to Skills
html = html.replace('<h2 class="section__heading" data-split>Skills &amp; Technologies</h2>', '<h2 class="section__heading" data-split>Skills</h2>')

# 4. Remove Experience and replace Certificates with Training, Certifications, Education
old_sections = """  <!-- ===================== CERTIFICATIONS & COURSES ===================== -->
  <section id="certificates" class="section achievements">
    <h2 class="section__heading" data-split>Certifications &amp; Courses</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Certificate 1 — Web Development</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 2 — AI Systems Engineer</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 3 — Security Fundamentals</div>
    </div>
  </section>

  <!-- ===================== EXPERIENCE ===================== -->
  <section id="experience" class="section achievements">
    <h2 class="section__heading" data-split>Experience</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Founded and launched independent high-end streetwear label</div>
      <div class="achievements__item" data-reveal>Built brand identity and physical launch presence</div>
      <div class="achievements__item" data-reveal>Deployed self-hosted AI system on personal hardware</div>
      <div class="achievements__item" data-reveal>Engineered multi-API automation tools</div>
      <div class="achievements__item" data-reveal>Established personal security lab</div>
      <div class="achievements__item" data-reveal>Cross-domain builder — systems + culture + media</div>
    </div>
  </section>"""

new_sections = """  <!-- ===================== TRAINING ===================== -->
  <section id="training" class="section achievements">
    <h2 class="section__heading" data-split>Training</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Training Instance</div>
    </div>
  </section>

  <!-- ===================== CERTIFICATIONS ===================== -->
  <section id="certificates" class="section achievements">
    <h2 class="section__heading" data-split>Certifications</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Certificate 1 — Web Development</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 2 — AI Systems Engineer</div>
      <div class="achievements__item" data-reveal>Placeholder Certificate 3 — Security Fundamentals</div>
    </div>
  </section>

  <!-- ===================== EDUCATION ===================== -->
  <section id="education" class="section achievements">
    <h2 class="section__heading" data-split>Education</h2>
    <div class="achievements__list">
      <div class="achievements__item" data-reveal>Placeholder Education Instance</div>
    </div>
  </section>"""

if old_sections in html:
    html = html.replace(old_sections, new_sections)
else:
    print("WARNING: Sections block not found!")

# Physically move Skills block if we really strictly need to.
# Since user asked to just update menu items, I will just reorder the HTML blocks to match the menu order so scrolling makes sense.
# Skills block (Capabilities):
cap_start = html.find('  <!-- ===================== SKILLS & TECHNOLOGIES ===================== -->\n  <section id="capabilities"')
if cap_start != -1:
    cap_end = html.find('  </section>', cap_start) + len('  </section>\n')
    cap_block = html[cap_start:cap_end]
    # delete it from current location
    html = html.replace(cap_block, '')
    
    # insert before projects (#work)
    work_loc = html.find('  <!-- ===================== PROJECTS ===================== -->\n  <section id="work"')
    if work_loc != -1:
        html = html[:work_loc] + cap_block + '\n' + html[work_loc:]

# Fix any stray newlines if they happen
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html")

# Update style.css
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update console-frame width and aspect-ratio
old_console_css = """.console-frame {
  position: relative;
  width: 100%;
  max-width: 580px;
  /* Magazine cover width */
  aspect-ratio: 3/4;
  max-height: 80vh;
  border: 1px solid rgba(255, 255, 255, 0.5);"""
new_console_css = """.console-frame {
  position: relative;
  width: 100%;
  max-width: 650px;
  /* Magazine cover width */
  aspect-ratio: auto;
  min-height: 600px;
  max-height: 90vh;
  border: 1px solid rgba(255, 255, 255, 0.5);"""

if old_console_css in css:
    css = css.replace(old_console_css, new_console_css)
else:
    print("WARNING: old_console_css not found")

# Update console-list gap
old_list_css = """.console-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}"""
new_list_css = """.console-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
}"""

if old_list_css in css:
    css = css.replace(old_list_css, new_list_css)
else:
    print("WARNING: old_list_css not found")

# Let's also ensure padding-bottom on the links if needed
css = css.replace('padding-bottom: 8px;', 'padding-bottom: 12px;')

with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated style.css")
