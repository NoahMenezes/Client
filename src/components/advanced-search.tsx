'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { searchGlobal, type SearchResult } from '@/app/actions/search'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-primary font-bold bg-yellow-100 dark:bg-yellow-900/30">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  )
}

export function AdvancedSearch() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const debouncedQuery = useDebounceValue(query, 300)
  const [data, setData] = React.useState<{
    leads: SearchResult[]
    employees: SearchResult[]
    quotations: SearchResult[]
  }>({ leads: [], employees: [], quotations: [] })
  const [isPending, startTransition] = React.useTransition()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  React.useEffect(() => {
    if (!debouncedQuery) {
      setData({ leads: [], employees: [], quotations: [] })
      return
    }

    startTransition(async () => {
      try {
        const results = await searchGlobal(debouncedQuery)
        setData(results)
      } catch (error) {
        console.error(error)
      }
    })
  }, [debouncedQuery])

  const handleSelect = (link: string) => {
    setOpen(false)
    router.push(link)
  }

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-9 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-64'
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search website...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-2xl" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search for leads, employees, and quotations</DialogDescription>
          </DialogHeader>
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <CommandInput
              placeholder="Type to search..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>{isPending ? 'Searching...' : 'No results found.'}</CommandEmpty>

              {!isPending && (
                <>
                  {data.leads.length > 0 && (
                    <CommandGroup heading="Leads">
                      {data.leads.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.subtitle || ''} ${item.status || ''}`}
                          onSelect={() => handleSelect(item.link)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              <Highlight text={item.title} query={debouncedQuery} />
                            </span>
                            {item.subtitle && (
                              <span className="text-xs text-muted-foreground">
                                <Highlight text={item.subtitle} query={debouncedQuery} />
                              </span>
                            )}
                          </div>
                          {item.status && (
                            <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded capitalize">
                              <Highlight text={item.status} query={debouncedQuery} />
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {data.leads.length > 0 &&
                    (data.employees.length > 0 || data.quotations.length > 0) && (
                      <CommandSeparator />
                    )}

                  {data.employees.length > 0 && (
                    <CommandGroup heading="Employees">
                      {data.employees.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.subtitle || ''}`}
                          onSelect={() => handleSelect(item.link)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              <Highlight text={item.title} query={debouncedQuery} />
                            </span>
                            {item.subtitle && (
                              <span className="text-xs text-muted-foreground">
                                <Highlight text={item.subtitle} query={debouncedQuery} />
                              </span>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {data.employees.length > 0 && data.quotations.length > 0 && <CommandSeparator />}

                  {data.quotations.length > 0 && (
                    <CommandGroup heading="Quotations">
                      {data.quotations.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.title} ${item.subtitle || ''} ${item.status || ''}`}
                          onSelect={() => handleSelect(item.link)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              <Highlight text={item.title} query={debouncedQuery} />
                            </span>
                            {item.subtitle && (
                              <span className="text-xs text-muted-foreground">
                                <Highlight text={item.subtitle} query={debouncedQuery} />
                              </span>
                            )}
                          </div>
                          {item.status && (
                            <span className="ml-auto text-xs bg-secondary px-2 py-0.5 rounded capitalize">
                              <Highlight text={item.status} query={debouncedQuery} />
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
