import { startTransition, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { AreaOption, LookupOption } from '../types/lookups';

type UseListingLookupsResult = {
  propertyTypes: LookupOption[];
  cities: LookupOption[];
  utilities: LookupOption[];
  areas: AreaOption[];
  loading: boolean;
  error: string;
};

export function useListingLookups(selectedCity: string): UseListingLookupsResult {
  const [propertyTypes, setPropertyTypes] = useState<LookupOption[]>([]);
  const [cities, setCities] = useState<LookupOption[]>([]);
  const [utilities, setUtilities] = useState<LookupOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBaseLookups() {
      const [{ data: propertyTypeRows, error: propertyTypeError }, { data: cityRows, error: cityError }, { data: utilityRows, error: utilityError }] =
        await Promise.all([
          supabase.from('property_types').select('id,label').order('id', { ascending: true }),
          supabase.from('cities').select('id,name').order('name', { ascending: true }),
          supabase.from('utilities').select('id,label').order('label', { ascending: true }),
        ]);

      if (cancelled) {
        return;
      }

      if (propertyTypeError || cityError || utilityError) {
        startTransition(() => {
          setError(propertyTypeError?.message || cityError?.message || utilityError?.message || 'We could not load listing options.');
          setLoading(false);
        });
        return;
      }

      startTransition(() => {
        setPropertyTypes((propertyTypeRows ?? []).map((item) => ({ id: item.id, label: item.label })));
        setCities((cityRows ?? []).map((item) => ({ id: item.id, label: item.name })));
        setUtilities((utilityRows ?? []).map((item) => ({ id: item.id, label: item.label })));
        setLoading(false);
      });
    }

    loadBaseLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAreas() {
      if (!selectedCity.trim()) {
        startTransition(() => {
          setAreas([]);
        });
        return;
      }

      const { data: city, error: cityError } = await supabase.from('cities').select('id').ilike('name', selectedCity.trim()).maybeSingle();

      if (cancelled) {
        return;
      }

      if (cityError) {
        startTransition(() => {
          setError(cityError.message);
          setAreas([]);
        });
        return;
      }

      if (!city) {
        startTransition(() => {
          setAreas([]);
        });
        return;
      }

      const { data: areaRows, error: areaError } = await supabase
        .from('areas')
        .select('id,name,city_id')
        .eq('city_id', city.id)
        .order('name', { ascending: true });

      if (cancelled) {
        return;
      }

      if (areaError) {
        startTransition(() => {
          setError(areaError.message);
          setAreas([]);
        });
        return;
      }

      startTransition(() => {
        setAreas((areaRows ?? []).map((item) => ({ id: item.id, name: item.name, cityId: item.city_id })));
      });
    }

    loadAreas();

    return () => {
      cancelled = true;
    };
  }, [selectedCity]);

  return { propertyTypes, cities, utilities, areas, loading, error };
}
