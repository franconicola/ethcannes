import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AvatarFiltersProps } from './types'

export function AvatarFilters({ filters, filterOptions, onFiltersChange, disabled = false }: AvatarFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ search: searchValue || null })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, filters.search, onFiltersChange])

  // Count active filters
  const activeFiltersCount = [filters.search, filters.gender, filters.style].filter(Boolean).length

  const clearAllFilters = () => {
    setSearchValue('')
    onFiltersChange({ search: null, gender: null, style: null })
  }

  return (
    <div className="px-4 lg:px-8 py-6 border-b bg-card">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search avatars..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              disabled={disabled}
              className="pl-10"
            />
          </div>

          {/* Style Filter */}
          {filterOptions.styles.length > 0 && (
            <Select
              value={filters.style || ''}
              onValueChange={(value) => onFiltersChange({ style: value || null })}
              disabled={disabled}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Styles</SelectItem>
                {filterOptions.styles.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Gender Filter - moved to the right */}
          <Select
            value={filters.gender || ''}
            onValueChange={(value) => onFiltersChange({ gender: value || null })}
            disabled={disabled}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Genders</SelectItem>
              {filterOptions.genders.map((gender) => (
                <SelectItem key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              disabled={disabled}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.search && (
            <Badge variant="outline" className="text-xs">
              Search: &quot;{filters.search}&quot;
              <button
                onClick={() => {
                  setSearchValue('')
                  onFiltersChange({ search: null })
                }}
                disabled={disabled}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.gender && (
            <Badge variant="outline" className="text-xs">
              Gender: {filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1)}
              <button
                onClick={() => onFiltersChange({ gender: null })}
                disabled={disabled}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.style && (
            <Badge variant="outline" className="text-xs">
              Style: {filters.style.charAt(0).toUpperCase() + filters.style.slice(1)}
              <button
                onClick={() => onFiltersChange({ style: null })}
                disabled={disabled}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
} 