import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface ResumeData {
  personal_info: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skills
  projects: Project[]
  certifications: Certification[]
  summary: string
}

export interface PersonalInfo {
  name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  portfolio?: string
}

export interface Experience {
  company: string
  position: string
  start_date: string
  end_date?: string
  current: boolean
  description: string
  achievements: string[]
  technologies: string[]
}

export interface Education {
  institution: string
  degree: string
  field: string
  start_date: string
  end_date?: string
  gpa?: string
}

export interface Skills {
  languages: string[]
  frameworks: string[]
  tools: string[]
  soft_skills: string[]
}

export interface Project {
  name: string
  description: string
  technologies: string[]
  url?: string
  highlights: string[]
}

export interface Certification {
  name: string
  issuer: string
  date: string
  credential_url?: string
}

class ResumeService {
  async parseResume(resumeText: string): Promise<ResumeData> {
    const sections = this.extractSections(resumeText)
    
    return {
      personal_info: this.extractPersonalInfo(sections.header || ''),
      experience: this.extractExperience(sections.experience || ''),
      education: this.extractEducation(sections.education || ''),
      skills: this.extractSkills(sections.skills || ''),
      projects: this.extractProjects(sections.projects || ''),
      certifications: this.extractCertifications(sections.certifications || ''),
      summary: sections.summary || ''
    }
  }

  private extractSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {}
    
    const sectionHeaders = [
      'experience', 'education', 'skills', 'projects', 
      'certifications', 'summary', 'objective'
    ]

    const lines = text.split('\n')
    let currentSection = 'header'
    let sectionContent: string[] = []

    lines.forEach(line => {
      const lowerLine = line.toLowerCase().trim()
      const matchedSection = sectionHeaders.find(header => 
        lowerLine.includes(header) && line.length < 50
      )

      if (matchedSection) {
        if (sectionContent.length > 0) {
          sections[currentSection] = sectionContent.join('\n')
        }
        currentSection = matchedSection
        sectionContent = []
      } else {
        sectionContent.push(line)
      }
    })

    if (sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n')
    }

    return sections
  }

  private extractPersonalInfo(headerText: string): PersonalInfo {
    const emailMatch = headerText.match(/[\w.-]+@[\w.-]+\.\w+/)
    const phoneMatch = headerText.match(/[\d\s()+-]{10,}/)
    const linkedinMatch = headerText.match(/linkedin\.com\/in\/[\w-]+/)
    
    const lines = headerText.split('\n').filter(l => l.trim())
    const name = lines[0]?.trim() || 'Not specified'

    return {
      name,
      email: emailMatch?.[0] || '',
      phone: phoneMatch?.[0]?.trim(),
      linkedin: linkedinMatch?.[0],
      location: this.extractLocation(headerText)
    }
  }

  private extractLocation(text: string): string | undefined {
    const locationPatterns = [
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /([A-Z][a-z]+\s*[A-Z][a-z]+,\s*[A-Z]{2})/
    ]

    for (const pattern of locationPatterns) {
      const match = text.match(pattern)
      if (match) return match[1]
    }
    return undefined
  }

  private extractExperience(experienceText: string): Experience[] {
    const experiences: Experience[] = []
    const blocks = experienceText.split(/\n\n+/)

    blocks.forEach(block => {
      if (block.trim().length < 20) return

      const lines = block.split('\n').filter(l => l.trim())
      if (lines.length < 2) return

      const companyLine = lines[0]
      const positionLine = lines[1]
      
      const dateMatch = block.match(/(\d{4})\s*[-–]\s*(\d{4}|Present|Current)/i)
      
      const technologies = this.extractTechnologies(block)
      const achievements = lines
        .filter(l => l.trim().match(/^[•\-*]/))
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())

      experiences.push({
        company: companyLine.trim(),
        position: positionLine.trim(),
        start_date: dateMatch?.[1] || '',
        end_date: dateMatch?.[2],
        current: /present|current/i.test(dateMatch?.[2] || ''),
        description: block,
        achievements,
        technologies
      })
    })

    return experiences
  }

  private extractEducation(educationText: string): Education[] {
    const education: Education[] = []
    const blocks = educationText.split(/\n\n+/)

    blocks.forEach(block => {
      if (block.trim().length < 10) return

      const lines = block.split('\n').filter(l => l.trim())
      const dateMatch = block.match(/(\d{4})\s*[-–]\s*(\d{4})/i)
      const gpaMatch = block.match(/GPA:\s*([\d.]+)/i)

      education.push({
        institution: lines[0]?.trim() || '',
        degree: lines[1]?.trim() || '',
        field: lines[2]?.trim() || '',
        start_date: dateMatch?.[1] || '',
        end_date: dateMatch?.[2],
        gpa: gpaMatch?.[1]
      })
    })

    return education
  }

  private extractSkills(skillsText: string): Skills {
    const allSkills = skillsText
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    const languages = allSkills.filter(s => 
      /python|java|javascript|typescript|c\+\+|ruby|go|rust|swift|kotlin/i.test(s)
    )

    const frameworks = allSkills.filter(s =>
      /react|angular|vue|django|flask|spring|express|next\.js|node\.js/i.test(s)
    )

    const tools = allSkills.filter(s =>
      /git|docker|kubernetes|aws|azure|gcp|jenkins|terraform/i.test(s)
    )

    const softSkills = allSkills.filter(s =>
      /leadership|communication|teamwork|problem.solving|agile/i.test(s)
    )

    return {
      languages,
      frameworks,
      tools,
      soft_skills: softSkills
    }
  }

  private extractProjects(projectsText: string): Project[] {
    const projects: Project[] = []
    const blocks = projectsText.split(/\n\n+/)

    blocks.forEach(block => {
      if (block.trim().length < 20) return

      const lines = block.split('\n').filter(l => l.trim())
      const urlMatch = block.match(/https?:\/\/[^\s]+/)
      const technologies = this.extractTechnologies(block)
      const highlights = lines
        .filter(l => l.trim().match(/^[•\-*]/))
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())

      projects.push({
        name: lines[0]?.trim() || '',
        description: lines[1]?.trim() || '',
        technologies,
        url: urlMatch?.[0],
        highlights
      })
    })

    return projects
  }

  private extractCertifications(certificationsText: string): Certification[] {
    const certifications: Certification[] = []
    const lines = certificationsText.split('\n').filter(l => l.trim())

    lines.forEach(line => {
      const dateMatch = line.match(/\d{4}/)
      const urlMatch = line.match(/https?:\/\/[^\s]+/)

      if (line.length > 10) {
        certifications.push({
          name: line.split(/[-–]/)[0]?.trim() || line,
          issuer: line.split(/[-–]/)[1]?.trim() || '',
          date: dateMatch?.[0] || '',
          credential_url: urlMatch?.[0]
        })
      }
    })

    return certifications
  }

  private extractTechnologies(text: string): string[] {
    const techKeywords = [
      'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Django', 'Flask', 'Spring',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
      'Redis', 'GraphQL', 'REST', 'Git', 'CI/CD'
    ]

    return techKeywords.filter(tech => 
      new RegExp(tech, 'i').test(text)
    )
  }

  async saveResumeData(userId: string, resumeData: ResumeData): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ resume_data: resumeData })
      .eq('id', userId)

    if (error) throw new Error(`Failed to save resume data: ${error.message}`)
  }

  async getResumeData(userId: string): Promise<ResumeData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('resume_data')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching resume data:', error)
      return null
    }

    return data?.resume_data || null
  }

  generateInterviewQuestionsFromResume(resumeData: ResumeData): string[] {
    const questions: string[] = []

    resumeData.experience.forEach(exp => {
      questions.push(`Tell me about your role as ${exp.position} at ${exp.company}.`)
      exp.achievements.forEach(achievement => {
        if (achievement.length > 20) {
          questions.push(`You mentioned "${achievement.substring(0, 50)}..." - can you elaborate on this?`)
        }
      })
    })

    resumeData.projects.forEach(project => {
      questions.push(`Walk me through your ${project.name} project.`)
      if (project.technologies.length > 0) {
        questions.push(`How did you use ${project.technologies[0]} in ${project.name}?`)
      }
    })

    resumeData.skills.languages.forEach(lang => {
      questions.push(`What's your experience level with ${lang}?`)
    })

    return questions.slice(0, 10)
  }

  calculateExperienceYears(resumeData: ResumeData): number {
    let totalMonths = 0

    resumeData.experience.forEach(exp => {
      const startYear = parseInt(exp.start_date)
      const endYear = exp.current ? new Date().getFullYear() : parseInt(exp.end_date || exp.start_date)
      
      if (!isNaN(startYear) && !isNaN(endYear)) {
        totalMonths += (endYear - startYear) * 12
      }
    })

    return Math.round(totalMonths / 12)
  }

  identifyStrengths(resumeData: ResumeData): string[] {
    const strengths: string[] = []

    if (resumeData.experience.length >= 3) {
      strengths.push('Diverse work experience')
    }

    if (resumeData.skills.languages.length >= 5) {
      strengths.push('Multi-language proficiency')
    }

    if (resumeData.projects.length >= 3) {
      strengths.push('Strong project portfolio')
    }

    if (resumeData.certifications.length >= 2) {
      strengths.push('Certified professional')
    }

    return strengths
  }
}

export const resumeService = new ResumeService()
