/**
 * Composant de recherche avec suggestions automatiques
 * Cache les résultats et fournit des suggestions en temps réel
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AutoComplete, Input, Empty, Spin } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import type { AutoCompleteProps } from "antd";
import { useDebounce } from "@hooks/useDebounce";
import { persistentCache } from "@utils/cachePersistent";
import "./AutoCompleteSearch.css";

interface AutoCompleteSearchProps<T = any> {
  placeholder?: string;
  onSearch: (query: string) => Promise<T[]>;
  onSelect?: (value: T, option: any) => void;
  onChange?: (value: string) => void;
  value?: string;
  displayField?: string | ((item: T) => string);
  descriptionField?: string | ((item: T) => string);
  cacheKey?: string;
  minLength?: number;
  debounceMs?: number;
  maxSuggestions?: number;
  allowClear?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
}

/**
 * Composant de recherche avec auto-complétion et cache
 */
export function AutoCompleteSearch<T = any>({
  placeholder = "Rechercher...",
  onSearch,
  onSelect,
  onChange,
  value: controlledValue,
  displayField = "name",
  descriptionField,
  cacheKey,
  minLength = 2,
  debounceMs = 300,
  maxSuggestions = 10,
  allowClear = true,
  size = "large",
  className = "",
}: AutoCompleteSearchProps<T>) {
  const [searchValue, setSearchValue] = useState(controlledValue || "");
  const [options, setOptions] = useState<
    Array<{ value: string; label: React.ReactNode; item: T }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Map<string, T[]>>(new Map());

  const debouncedSearch = useDebounce(searchValue, debounceMs);

  // Charger le cache depuis IndexedDB au montage
  useEffect(() => {
    if (!cacheKey) return;

    const loadCache = async () => {
      try {
        const saved = await persistentCache.getPreference<Record<string, T[]>>(
          `search_cache_${cacheKey}`
        );
        if (saved) {
          setCache(new Map(Object.entries(saved)));
        }
      } catch (error) {
        console.warn("Failed to load search cache:", error);
      }
    };

    loadCache();
  }, [cacheKey]);

  // Sauvegarder le cache dans IndexedDB
  useEffect(() => {
    if (!cacheKey || cache.size === 0) return;

    const saveCache = async () => {
      try {
        const cacheObj = Object.fromEntries(cache);
        await persistentCache.savePreference(
          `search_cache_${cacheKey}`,
          cacheObj
        );
      } catch (error) {
        console.warn("Failed to save search cache:", error);
      }
    };

    const timer = setTimeout(saveCache, 5000); // Sauvegarder après 5 secondes d'inactivité
    return () => clearTimeout(timer);
  }, [cache, cacheKey]);

  // Recherche avec cache
  const performSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < minLength) {
        setOptions([]);
        return;
      }

      const queryLower = query?.toLowerCase() || "";

      // Vérifier le cache d'abord
      const cachedResults = queryLower ? cache.get(queryLower) : undefined;
      if (cachedResults) {
        const formattedOptions = formatOptions(
          cachedResults.slice(0, maxSuggestions)
        );
        setOptions(formattedOptions);
        return;
      }

      // Recherche via API
      setLoading(true);
      try {
        const results = await onSearch(query);

        // Mettre en cache les résultats
        const newCache = new Map(cache);
        newCache.set(queryLower, results);
        setCache(newCache);

        // Limiter le cache à 100 entrées
        if (newCache.size > 100) {
          const firstKey = newCache.keys().next().value;
          if (firstKey) {
            newCache.delete(firstKey);
          }
        }

        const formattedOptions = formatOptions(
          results.slice(0, maxSuggestions)
        );
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Search error:", error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [onSearch, cache, minLength, maxSuggestions, displayField, descriptionField]
  );

  // Formater les options pour l'AutoComplete
  const formatOptions = useCallback(
    (items: T[]): Array<{ value: string; label: React.ReactNode; item: T }> => {
      return items.map((item) => {
        const display =
          typeof displayField === "function"
            ? displayField(item)
            : (item as any)[displayField] || String(item);

        const description = descriptionField
          ? typeof descriptionField === "function"
            ? descriptionField(item)
            : (item as any)[descriptionField]
          : null;

        return {
          value: display,
          label: (
            <div className="autocomplete-option">
              <div className="autocomplete-option-main">{display}</div>
              {description && (
                <div className="autocomplete-option-desc">{description}</div>
              )}
            </div>
          ),
          item,
        };
      });
    },
    [displayField, descriptionField]
  );

  // Recherche déclenchée par le debounce
  useEffect(() => {
    if (debouncedSearch !== undefined) {
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch, performSearch]);

  // Gérer le changement de valeur
  const handleChange = (value: string) => {
    setSearchValue(value);
    if (onChange) {
      onChange(value);
    }
    if (!value) {
      setOptions([]);
    }
  };

  // Gérer la sélection
  const handleSelect = (value: string, option: any) => {
    setSearchValue(value);
    if (onSelect && option?.item) {
      onSelect(option.item, option);
    }
  };

  // Suggestions partielles (pour les recherches précédentes)
  const filteredOptions = useMemo(() => {
    if (!searchValue || searchValue.length < minLength) {
      return [];
    }

    const suggestions: Array<{ value: string; label: React.ReactNode }> = [];

    // Ajouter des suggestions basées sur le cache
    cache.forEach((items, cachedQuery) => {
      if (cachedQuery.includes(searchValue.toLowerCase())) {
        items.slice(0, 3).forEach((item) => {
          const display =
            typeof displayField === "function"
              ? displayField(item)
              : (item as any)[displayField] || String(item);

          suggestions.push({
            value: display,
            label: display,
          });
        });
      }
    });

    return suggestions.slice(0, 5);
  }, [searchValue, cache, minLength, displayField]);

  const allOptions = useMemo(() => {
    if (options.length > 0) {
      return options;
    }
    return filteredOptions.map((opt) => ({
      ...opt,
      item: null as T | null,
    }));
  }, [options, filteredOptions]);

  return (
    <AutoComplete
      className={`autocomplete-search ${className}`}
      value={
        controlledValue !== undefined ? controlledValue : searchValue || ""
      }
      options={allOptions}
      onSelect={handleSelect}
      onSearch={handleChange}
      notFoundContent={loading ? null : <Empty description="Aucun résultat" />}
      allowClear={allowClear}
      size={size}
      placeholder={placeholder}
      filterOption={false} // On gère le filtrage nous-mêmes
      open={loading || allOptions.length > 0 ? undefined : false}
    >
      <Input
        prefix={loading ? <LoadingOutlined spin /> : <SearchOutlined />}
        placeholder={placeholder}
        allowClear={allowClear}
      />
    </AutoComplete>
  );
}

/**
 * Hook pour la recherche avec suggestions
 */
export function useAutoCompleteSearch<T = any>(
  onSearch: (query: string) => Promise<T[]>,
  options: Omit<AutoCompleteSearchProps<T>, "onSearch"> = {}
) {
  const [value, setValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const handleSelect = useCallback((item: T) => {
    setSelectedItem(item);
  }, []);

  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    if (!newValue) {
      setSelectedItem(null);
    }
  }, []);

  return {
    searchValue: value,
    selectedItem,
    AutoCompleteComponent: (
      <AutoCompleteSearch
        {...options}
        value={value}
        onSearch={onSearch}
        onSelect={handleSelect}
        onChange={handleChange}
      />
    ),
    setValue,
    setSelectedItem,
  };
}
