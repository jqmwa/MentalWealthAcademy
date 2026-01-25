-- Seed the 12 chapters
INSERT INTO library_chapters (chapter_number, title, description, theme, image_url) VALUES
(1, 'The First Step', 'Begin your journey of self-discovery. This chapter focuses on understanding who you are at your core - your values, beliefs, and the patterns that shape your daily life.', 'Self-Awareness', '/uploads/chapter-1.png'),
(2, 'Emotional Currents', 'Explore the depths of your emotional landscape. Learn to recognize, understand, and navigate your feelings with greater clarity and purpose.', 'Emotional Intelligence', '/uploads/chapter-2.png'),
(3, 'The Inner Critic', 'Face the voice within that judges and doubts. Transform your relationship with self-criticism into one of compassion and growth.', 'Self-Compassion', '/uploads/chapter-3.png'),
(4, 'Building Bridges', 'Examine the connections that define your life. Strengthen bonds, set healthy boundaries, and cultivate meaningful relationships.', 'Relationships', '/uploads/chapter-4.png'),
(5, 'Stillness Within', 'Discover the power of presence. Through mindfulness practices, learn to find calm amidst chaos and clarity in uncertainty.', 'Mindfulness', '/uploads/chapter-5.png'),
(6, 'Resilient Spirit', 'Build your capacity to weather life''s storms. Develop coping strategies that honor your needs while fostering growth.', 'Coping Skills', '/uploads/chapter-6.png'),
(7, 'Purpose & Meaning', 'Uncover what truly matters to you. Explore your values, passions, and the unique contribution you bring to the world.', 'Values Exploration', '/uploads/chapter-7.png'),
(8, 'Body & Mind', 'Honor the connection between physical and mental wellness. Explore how caring for your body nurtures your spirit.', 'Physical Wellness', '/uploads/chapter-8.png'),
(9, 'Creative Flow', 'Tap into your innate creativity as a healing force. Express what words alone cannot capture through various forms of art.', 'Expression & Art', '/uploads/chapter-9.png'),
(10, 'Community Bonds', 'Recognize the strength found in community. Learn to give and receive support while building your circle of wellness.', 'Social Support', '/uploads/chapter-10.png'),
(11, 'Future Self', 'Envision the person you''re becoming. Set intentions and create a roadmap toward your most authentic, flourishing self.', 'Goal Setting', '/uploads/chapter-11.png'),
(12, 'The Unsealed Path', 'Integrate all you''ve learned into a cohesive practice. Your journey of 12 chapters becomes a lifelong path of growth.', 'Integration', '/uploads/chapter-12.png');

-- Seed prompts for Chapter 1: The First Step
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(1, 1, 'Describe yourself as if you were introducing yourself to someone who has never met you. What would you want them to know about who you really are?', 'I am someone who...', 100),
(1, 2, 'What are three values that guide your decisions in life? Write about a time when one of these values was tested.', 'The values that matter most to me...', 100),
(1, 3, 'Reflect on your daily routines. Which habits serve your wellbeing, and which ones might be holding you back?', 'When I look at my daily patterns...', 100),
(1, 4, 'What beliefs about yourself were formed in childhood? Which ones still serve you, and which might need updating?', 'Growing up, I learned to believe...', 100),
(1, 5, 'Describe a moment when you felt most authentically yourself. What were you doing? Who were you with?', 'I feel most like myself when...', 100),
(1, 6, 'If you could have a conversation with your younger self, what would you say? What wisdom would you share?', 'Dear younger me...', 100),
(1, 7, 'Looking at this week''s reflections, what patterns or themes do you notice about yourself? What surprised you?', 'This week I discovered...', 100);

-- Seed prompts for Chapter 2: Emotional Currents
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(2, 1, 'Name five emotions you experienced today. For each one, describe where you felt it in your body.', 'Today I felt...', 100),
(2, 2, 'Write about an emotion you tend to avoid or suppress. Why do you think you resist this feeling?', 'The emotion I often push away is...', 100),
(2, 3, 'Describe a recent situation where your emotional reaction surprised you. What might have triggered this response?', 'I was surprised when I felt...', 100),
(2, 4, 'How did the people in your life express emotions when you were growing up? How has this shaped your own emotional expression?', 'In my family, emotions were...', 100),
(2, 5, 'Write a letter to an emotion you struggle with. What would you say if you could speak to it directly?', 'Dear [emotion]...', 100),
(2, 6, 'Describe a time when you successfully navigated a difficult emotional situation. What strategies helped you?', 'When I faced that challenge...', 100),
(2, 7, 'What have you learned about your emotional patterns this week? How might you approach your emotions differently?', 'My emotional landscape...', 100);

-- Seed prompts for Chapter 3: The Inner Critic
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(3, 1, 'What does your inner critic sound like? Write down the most common criticisms it makes about you.', 'My inner critic often says...', 100),
(3, 2, 'Whose voice does your inner critic resemble? Where might you have first learned to speak to yourself this way?', 'When I listen closely, I hear...', 100),
(3, 3, 'Write about a mistake you made recently. Now rewrite that story as if you were telling it about a dear friend.', 'When this happened...', 100),
(3, 4, 'What would you say to comfort a child who made the same mistake you''re criticizing yourself for?', 'If a child came to me...', 100),
(3, 5, 'List five things you genuinely appreciate about yourself. For each one, provide specific evidence.', 'I appreciate that I...', 100),
(3, 6, 'Write a compassionate response to your inner critic. What does it really need to hear?', 'Thank you for trying to protect me, but...', 100),
(3, 7, 'How has your relationship with self-criticism shifted this week? What practices might help you cultivate more self-compassion?', 'This week taught me...', 100);

-- Seed prompts for Chapter 4: Building Bridges
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(4, 1, 'Map out your closest relationships. Who energizes you? Who drains you? What patterns do you notice?', 'The people in my life...', 100),
(4, 2, 'Describe your relationship with boundaries. Where do you set them easily? Where do you struggle?', 'When it comes to boundaries...', 100),
(4, 3, 'Write about a relationship that has changed significantly over time. What caused the shift?', 'This relationship transformed when...', 100),
(4, 4, 'What do you need from your relationships that you struggle to ask for? What holds you back?', 'I often need...', 100),
(4, 5, 'Describe your communication style in conflict. How might you approach disagreements differently?', 'When conflict arises, I tend to...', 100),
(4, 6, 'Write a letter (not to send) to someone you have unresolved feelings about. Express what you''ve been holding back.', 'What I''ve wanted to tell you...', 100),
(4, 7, 'What insights about your relationships emerged this week? What one change could improve your connections?', 'Reflecting on my relationships...', 100);

-- Seed prompts for Chapter 5: Stillness Within
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(5, 1, 'Describe this present moment using all five senses. What do you notice when you really pay attention?', 'Right now, I notice...', 100),
(5, 2, 'What pulls your attention away most often? Write about where your mind goes when it wanders.', 'My mind often drifts to...', 100),
(5, 3, 'Describe a mundane activity (eating, walking, showering) as if experiencing it for the first time.', 'As I [activity], I notice...', 100),
(5, 4, 'Write about a worry or anxiety you carry. What happens when you observe it without trying to fix it?', 'When I simply observe this worry...', 100),
(5, 5, 'Describe a moment of unexpected peace or beauty you experienced recently. What made it special?', 'There was a moment when...', 100),
(5, 6, 'What thoughts or judgments arise repeatedly when you try to be still? Write them down without editing.', 'When I sit with silence...', 100),
(5, 7, 'How has practicing presence affected you this week? What moments of mindfulness will you carry forward?', 'This week of presence taught me...', 100);

-- Seed prompts for Chapter 6: Resilient Spirit
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(6, 1, 'Describe a difficult period you survived. What got you through it? What strengths did you discover?', 'When I faced that challenge...', 100),
(6, 2, 'What are your go-to coping mechanisms when stressed? Which ones help? Which ones might be harmful?', 'When stress hits, I usually...', 100),
(6, 3, 'Write about a fear that holds you back. What would your life look like if you could move through it?', 'I''m afraid of...', 100),
(6, 4, 'Who or what do you turn to for support during hard times? How might you expand your support system?', 'My sources of support are...', 100),
(6, 5, 'Describe a setback you''re currently facing. Write three different perspectives on this situation.', 'From one angle...', 100),
(6, 6, 'What self-care practices genuinely restore you? What gets in the way of doing them consistently?', 'I feel restored when...', 100),
(6, 7, 'Looking at this week''s reflections, what resilience tools do you want to strengthen? What''s one step you can take?', 'My resilience practice...', 100);

-- Seed prompts for Chapter 7: Purpose & Meaning
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(7, 1, 'If money and time were no object, how would you spend your days? What does this reveal about your values?', 'In my ideal life...', 100),
(7, 2, 'What activities make you lose track of time? When do you feel most alive and engaged?', 'I lose myself in...', 100),
(7, 3, 'Describe someone you admire. What qualities do they embody that you wish to cultivate in yourself?', 'I admire this person because...', 100),
(7, 4, 'What legacy do you want to leave? How do you want to be remembered by those who matter most?', 'I want to be remembered for...', 100),
(7, 5, 'Write about a time when your actions aligned perfectly with your values. How did it feel?', 'When I lived my values...', 100),
(7, 6, 'What meaningful contribution could you make to your community or the world? What holds you back from making it?', 'I could contribute...', 100),
(7, 7, 'What have you discovered about your purpose this week? What small step could you take toward more meaningful living?', 'My sense of purpose...', 100);

-- Seed prompts for Chapter 8: Body & Mind
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(8, 1, 'How does your body feel right now? Scan from head to toe and describe what you notice without judgment.', 'Starting at my head...', 100),
(8, 2, 'Describe your relationship with sleep. What helps you rest? What keeps you awake?', 'When it comes to sleep...', 100),
(8, 3, 'Write about how you nourish your body. What does your relationship with food and eating look like?', 'My relationship with food...', 100),
(8, 4, 'How does your body respond to stress? Where do you hold tension? What does your body need in those moments?', 'When I''m stressed, my body...', 100),
(8, 5, 'Describe a time when you felt at home in your body. What contributed to that feeling of embodiment?', 'I felt connected to my body when...', 100),
(8, 6, 'What movement or physical activity brings you joy (not obligation)? When did you last experience it?', 'I find joy in moving my body through...', 100),
(8, 7, 'What has this week revealed about your body-mind connection? What one practice could honor this connection?', 'My body and mind...', 100);

-- Seed prompts for Chapter 9: Creative Flow
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(9, 1, 'Describe a color, sound, or image that represents how you''re feeling today. Why did you choose this?', 'Today feels like...', 100),
(9, 2, 'Write about your relationship with creativity. When did you feel most creative? What happened to that part of you?', 'My creative self...', 100),
(9, 3, 'Express a difficult emotion through metaphor. If your feeling were a weather pattern, landscape, or creature, what would it be?', 'This feeling is like...', 100),
(9, 4, 'Describe a piece of art, music, or writing that deeply moved you. What did it awaken in you?', 'When I experienced this...', 100),
(9, 5, 'Write without stopping for 10 minutes. Don''t edit, just let words flow. What emerges?', 'Stream of consciousness...', 100),
(9, 6, 'If you could create anything without fear of judgment, what would you make? Describe it in detail.', 'If I weren''t afraid...', 100),
(9, 7, 'How has creative expression affected you this week? What forms of creativity will you explore further?', 'Creativity this week...', 100);

-- Seed prompts for Chapter 10: Community Bonds
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(10, 1, 'Map your community - from close friends to acquaintances. Where do you feel most connected? Most isolated?', 'My community includes...', 100),
(10, 2, 'Write about a time someone''s support made a real difference in your life. What did they do that mattered?', 'Their support changed things because...', 100),
(10, 3, 'How comfortable are you asking for help? What makes it difficult? What might make it easier?', 'When I need help...', 100),
(10, 4, 'Describe how you show up for others. In what ways do you give support? What does generosity look like for you?', 'I support others by...', 100),
(10, 5, 'Write about a community or group where you feel you truly belong. What makes this space special?', 'I feel I belong when...', 100),
(10, 6, 'What barriers prevent you from deeper connection with others? What would help you overcome them?', 'What stands between me and deeper connection...', 100),
(10, 7, 'What insights about community and support emerged this week? How might you strengthen your social wellness?', 'Community means...', 100);

-- Seed prompts for Chapter 11: Future Self
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(11, 1, 'Describe your ideal self one year from now. What does your life look like? How do you feel?', 'In one year...', 100),
(11, 2, 'What goal have you been avoiding? Write about what makes it feel impossible and what might make it possible.', 'The goal I keep putting off...', 100),
(11, 3, 'Break down one big dream into the smallest possible first step. What would that step be? When could you take it?', 'The first tiny step...', 100),
(11, 4, 'Write a letter from your future self who has achieved something meaningful. What advice do they give you?', 'Dear present me...', 100),
(11, 5, 'What would you attempt if you knew you could not fail? What does this reveal about what you really want?', 'If failure were impossible...', 100),
(11, 6, 'Describe the obstacles between you and your goals. Now write about the resources and strengths you have to overcome them.', 'The obstacles are... but I have...', 100),
(11, 7, 'What clarity about your future has emerged this week? What intention will you carry forward?', 'Moving forward...', 100);

-- Seed prompts for Chapter 12: The Unsealed Path
INSERT INTO library_prompts (chapter_id, day_number, prompt_text, placeholder_text, min_characters) VALUES
(12, 1, 'Look back at your journey through these chapters. What has been your most significant insight or shift?', 'The biggest change has been...', 100),
(12, 2, 'Which chapter''s theme still challenges you most? What ongoing practice might help?', 'I still struggle with...', 100),
(12, 3, 'Write about how you''ve grown through this process. What can you do now that you couldn''t before?', 'I''ve grown in...', 100),
(12, 4, 'Design your personal wellness practice. What daily, weekly, and monthly rituals will support your continued growth?', 'My practice includes...', 100),
(12, 5, 'Write a commitment letter to yourself. What promises will you make for your continued wellbeing?', 'I commit to...', 100),
(12, 6, 'How will you share what you''ve learned? Who in your life might benefit from these reflections?', 'I want to share...', 100),
(12, 7, 'Reflect on the person you were when you started and who you are now. Write a closing message to both versions of yourself.', 'To who I was and who I am...', 100);
