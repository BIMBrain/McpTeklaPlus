import { useState, useMemo } from 'react'
import { Command, KnowledgeItem, SearchResult } from '@/types/commands'

interface UseCommandSearchOptions {
  commands: Command[]
  knowledgeBase: KnowledgeItem[]
  maxResults?: number
}

export function useCommandSearch({ 
  commands, 
  knowledgeBase, 
  maxResults = 10 
}: UseCommandSearchOptions) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Simple text search function
  const searchText = (text: string, query: string): number => {
    if (!query) return 0
    
    const normalizedText = text.toLowerCase()
    const normalizedQuery = query.toLowerCase()
    
    // Exact match gets highest score
    if (normalizedText.includes(normalizedQuery)) {
      const exactMatch = normalizedText === normalizedQuery
      const startsWith = normalizedText.startsWith(normalizedQuery)
      
      if (exactMatch) return 100
      if (startsWith) return 80
      return 60
    }
    
    // Fuzzy matching for individual words
    const queryWords = normalizedQuery.split(' ')
    const textWords = normalizedText.split(' ')
    
    let matchCount = 0
    queryWords.forEach(queryWord => {
      textWords.forEach(textWord => {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matchCount++
        }
      })
    })
    
    return matchCount > 0 ? (matchCount / queryWords.length) * 40 : 0
  }

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return popular commands when no search query
      const popularCommands = commands
        .filter(cmd => selectedCategory === 'all' || cmd.category === selectedCategory)
        .sort((a, b) => b.usage - a.usage)
        .slice(0, maxResults)
        .map(cmd => ({
          item: cmd,
          score: cmd.usage,
          type: 'command' as const,
          highlights: []
        }))
      
      return popularCommands
    }

    const results: SearchResult[] = []

    // Search commands
    commands.forEach(command => {
      if (selectedCategory !== 'all' && command.category !== selectedCategory) {
        return
      }

      let score = 0
      const highlights: string[] = []

      // Search in title (highest weight)
      const titleScore = searchText(command.title, searchQuery)
      if (titleScore > 0) {
        score += titleScore * 3
        highlights.push('title')
      }

      // Search in description
      const descScore = searchText(command.description, searchQuery)
      if (descScore > 0) {
        score += descScore * 2
        highlights.push('description')
      }

      // Search in content
      const contentScore = searchText(command.content, searchQuery)
      if (contentScore > 0) {
        score += contentScore * 1.5
        highlights.push('content')
      }

      // Search in tags
      const tagScore = command.tags.reduce((acc, tag) => {
        const tagMatch = searchText(tag, searchQuery)
        if (tagMatch > 0) highlights.push('tags')
        return acc + tagMatch
      }, 0)
      score += tagScore

      // Search in examples
      if (command.examples) {
        const exampleScore = command.examples.reduce((acc, example) => {
          const exampleMatch = searchText(example, searchQuery)
          if (exampleMatch > 0) highlights.push('examples')
          return acc + exampleMatch
        }, 0)
        score += exampleScore * 0.8
      }

      // Boost score based on usage frequency
      score += Math.log(command.usage + 1) * 2

      // Boost favorites
      if (command.isFavorite) {
        score += 10
      }

      if (score > 0) {
        results.push({
          item: command,
          score,
          type: 'command',
          highlights: [...new Set(highlights)]
        })
      }
    })

    // Search knowledge base
    knowledgeBase.forEach(knowledge => {
      let score = 0
      const highlights: string[] = []

      const titleScore = searchText(knowledge.title, searchQuery)
      if (titleScore > 0) {
        score += titleScore * 2.5
        highlights.push('title')
      }

      const contentScore = searchText(knowledge.content, searchQuery)
      if (contentScore > 0) {
        score += contentScore * 1.5
        highlights.push('content')
      }

      const tagScore = knowledge.tags.reduce((acc, tag) => {
        const tagMatch = searchText(tag, searchQuery)
        if (tagMatch > 0) highlights.push('tags')
        return acc + tagMatch
      }, 0)
      score += tagScore

      if (score > 0) {
        results.push({
          item: knowledge,
          score,
          type: 'knowledge',
          highlights: [...new Set(highlights)]
        })
      }
    })

    // Sort by score and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
  }, [searchQuery, selectedCategory, commands, knowledgeBase, maxResults])

  const popularCommands = useMemo(() => {
    return commands
      .filter(cmd => cmd.isFavorite || cmd.usage > 50)
      .sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1
        if (!a.isFavorite && b.isFavorite) return 1
        return b.usage - a.usage
      })
      .slice(0, 10)
  }, [commands])

  const recentCommands = useMemo(() => {
    return commands
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
      .slice(0, 5)
  }, [commands])

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    searchResults,
    popularCommands,
    recentCommands
  }
}
