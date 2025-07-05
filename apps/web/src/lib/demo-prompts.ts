import { AIAgentPrompt, retrieveAgentPrompt, storeAgentPrompt } from './storage'

// Demo system prompts for existing avatars
export const demoPrompts: Record<string, AIAgentPrompt> = {
  'math-tutor': {
    agentId: 'math-tutor',
    agentName: 'Math Tutor',
    systemPrompt: `You are a friendly and encouraging AI math tutor for elementary school students. 

Your role is to:
- Help students understand basic math concepts through simple explanations
- Use visual examples and real-world applications when possible
- Encourage students when they struggle and celebrate their successes
- Break down complex problems into smaller, manageable steps
- Ask guiding questions to help students think through problems
- Keep language age-appropriate and engaging for 6-12 year olds
- Focus on building confidence and a positive relationship with math

Always be patient, supportive, and remember that every student learns at their own pace. Make math fun and accessible!`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'educational-team',
    educationalLevel: 'elementary',
    subjects: ['mathematics', 'arithmetic', 'basic-algebra'],
    safetyRating: 'safe'
  },
  
  'science-buddy': {
    agentId: 'science-buddy',
    agentName: 'Science Buddy',
    systemPrompt: `You are an enthusiastic AI science companion for curious young minds!

Your mission is to:
- Spark curiosity about the natural world and scientific phenomena
- Explain science concepts in simple, exciting ways
- Use analogies and examples that kids can relate to
- Encourage hands-on thinking and safe experimentation
- Answer "why" and "how" questions with wonder and precision
- Connect science to everyday life and experiences
- Promote scientific thinking and observation skills
- Keep explanations appropriate for middle school students (ages 11-14)

Remember: Science is everywhere and everyone can be a scientist! Foster that natural curiosity and help students see the magic in understanding how things work.`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'educational-team',
    educationalLevel: 'middle',
    subjects: ['science', 'biology', 'chemistry', 'physics'],
    safetyRating: 'safe'
  },
  
  'reading-guide': {
    agentId: 'reading-guide',
    agentName: 'Reading Guide',
    systemPrompt: `You are a supportive AI reading companion dedicated to helping students develop strong literacy skills.

Your purpose is to:
- Help students improve reading comprehension through thoughtful questions
- Assist with vocabulary building using context clues and examples
- Encourage a love of reading by discussing stories and characters
- Support students with different reading levels and learning styles
- Provide gentle guidance for pronunciation and fluency
- Connect reading to students' interests and experiences
- Foster critical thinking about texts and their meanings
- Create a safe space for students to practice and make mistakes

Focus on building confidence and enjoyment in reading. Every student has the potential to become a skilled reader with the right support and encouragement.`,
    version: '1.0',
    createdAt: new Date().toISOString(),
    createdBy: 'educational-team',
    educationalLevel: 'elementary',
    subjects: ['reading', 'literature', 'vocabulary', 'comprehension'],
    safetyRating: 'safe'
  }
}

// Demo function to store prompts for existing avatars
export const storeAvatarPrompts = async (privateKey: string) => {
  const results = []
  
  for (const [avatarId, prompt] of Object.entries(demoPrompts)) {
    try {
      console.log(`📄 Storing prompt for ${avatarId}...`)
      const stored = await storeAgentPrompt(prompt, privateKey)
      results.push({
        avatarId,
        success: true,
        data: stored
      })
      console.log(`✅ Successfully stored prompt for ${avatarId}`)
    } catch (error) {
      console.error(`❌ Failed to store prompt for ${avatarId}:`, error)
      results.push({
        avatarId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  return results
}

// Demo function to retrieve and verify prompts
export const verifyAvatarPrompts = async (promptHashes: Record<string, string>) => {
  const results = []
  
  for (const [avatarId, hash] of Object.entries(promptHashes)) {
    try {
      console.log(`🔍 Verifying prompt for ${avatarId}...`)
      const retrieved = await retrieveAgentPrompt(hash)
      results.push({
        avatarId,
        success: true,
        data: retrieved,
        hash
      })
      console.log(`✅ Successfully verified prompt for ${avatarId}`)
    } catch (error) {
      console.error(`❌ Failed to verify prompt for ${avatarId}:`, error)
      results.push({
        avatarId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        hash
      })
    }
  }
  
  return results
}

// Function to update avatar data with 0G storage references
export const updateAvatarsWith0GData = (avatars: any[], promptResults: any[]) => {
  return avatars.map(avatar => {
    const promptResult = promptResults.find(r => r.avatarId === avatar.id)
    if (promptResult && promptResult.success) {
      return {
        ...avatar,
        promptHash: promptResult.data.rootHash,
        promptVersion: promptResult.data.version,
        educationalLevel: demoPrompts[avatar.id]?.educationalLevel || 'elementary',
        subjects: demoPrompts[avatar.id]?.subjects || [],
        safetyRating: demoPrompts[avatar.id]?.safetyRating || 'pending',
        verifiedAt: new Date().toISOString()
      }
    }
    return avatar
  })
}

// Example usage instructions
export const usageInstructions = `
## How to Integrate 0G Storage with Your AI Tutors

### Step 1: Store System Prompts
\`\`\`typescript
import { storeAvatarPrompts } from '@/lib/demo-prompts'

// Store all demo prompts on 0G Storage
const results = await storeAvatarPrompts('your-private-key')
console.log('Storage results:', results)
\`\`\`

### Step 2: Update Avatar Data
\`\`\`typescript
import { updateAvatarsWith0GData } from '@/lib/demo-prompts'

// Update your avatars with 0G storage references
const updatedAvatars = updateAvatarsWith0GData(originalAvatars, storageResults)
\`\`\`

### Step 3: Verify During Runtime
\`\`\`typescript
import { verifyAvatarPrompts } from '@/lib/demo-prompts'

// Verify prompt integrity before using
const verification = await verifyAvatarPrompts({
  'math-tutor': '0x1234...hash',
  'science-buddy': '0x5678...hash'
})
\`\`\`

### Step 4: Display Verification Status
The VerificationBadge component automatically shows:
- ✅ Verified Safe (green)
- 🔍 Under Review (yellow)
- ❌ Not Verified (red)
- ⏳ Pending Review (gray)

This creates a complete trust system where parents and educators can verify that AI tutors are using approved, immutable educational content.
` 