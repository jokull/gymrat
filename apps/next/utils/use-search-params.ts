/* eslint-disable */
/* @ts-ignore */

import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { z } from "zod";

type ZodCoercePrimitives = {
  [K in keyof typeof z.coerce]: ReturnType<typeof z.coerce[K]>;
};

type ZodCoercePrimitiveNames = keyof ZodCoercePrimitives;

type ZodCoercePrimitiveBaseTypes =
  | ZodCoercePrimitives[ZodCoercePrimitiveNames]
  | z.ZodEnum<any>;

type ZodCoercePrimitiveTypes =
  | ZodCoercePrimitiveBaseTypes
  | z.ZodDefault<ZodCoercePrimitiveBaseTypes>;

type UseParamSchema = Record<string, ZodCoercePrimitiveTypes>;

type UseParams<T> = T extends UseParamSchema
  ? {
      [K in keyof T]: z.infer<T[K]>;
    }
  : never;

function getDefaultValue<T extends ZodCoercePrimitiveTypes>(
  def: T["_def"]
): z.infer<T> | undefined {
  if ("defaultValue" in def) {
    return def.defaultValue() as unknown;
  }
}

function isZodType(t: z.ZodTypeAny, type: z.ZodFirstPartyTypeKind): boolean {
  if (t._def?.typeName === type) {
    return true;
  }
  if (
    t._def?.typeName === z.ZodFirstPartyTypeKind.ZodEffects &&
    (t as z.ZodEffects<any>)._def.effect.type === "refinement"
  ) {
    return isZodType((t as z.ZodEffects<any>).innerType(), type);
  }
  if (t._def?.innerType) {
    return isZodType(t._def?.innerType, type);
  }
  return false;
}

function validateParam<T extends ZodCoercePrimitiveTypes>(
  schema: T,
  parameter: z.infer<T>
): z.infer<T> {
  try {
    const parsed: z.infer<T> = schema.parse(parameter);
    return parsed;
  } catch (error) {
    return getDefaultValue(schema._def);
  }
}

/**
 * Follow and update URL type safe search parameters
 *
 * @param schemas - Object of param name keys and zod schemas (must have `.default(value)` for each
 * schema)
 * @returns Object of coerced values and `setParam` to update a single parameter
 *
 * @example Using search param to flip between page sections
 * ```tsx
 * function Component() {
 *   const [{ screen }, setSearchParam] = useSearchParams({
 *     screen: z.enum(['login', 'signup']).default('login'),
 *   });
 *   return screen === 'login' ? <Login /> : <Signup />;
 * }
 * ```
 */
export function useSearchParams<T extends UseParamSchema>(schema: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useNextSearchParams();

  // if (router.isReady && router.asPath.includes("?")) {
  //   searchParams = new URLSearchParams(router.asPath.split("?", 2)[1]);
  // } else {
  //   searchParams = new URLSearchParams();
  // }

  const entries = Object.entries(schema).map(([key, paramSchema]) => {
    const validatedValue = validateParam(
      paramSchema,
      searchParams.get(key) ?? getDefaultValue(paramSchema._def)
    );
    return [key, validatedValue];
  });

  const obj = Object.fromEntries(entries) as UseParams<T>;

  function setSearchParam<K extends keyof T & string>(
    key: K,
    newValue: z.infer<T[K]>
  ) {
    const paramSchema = schema[key]!;
    const newSearchParams = new URLSearchParams(searchParams);
    const validated = validateParam(paramSchema, newValue);
    const stringified = isZodType(paramSchema, z.ZodFirstPartyTypeKind.ZodDate)
      ? (validated as Date).toISOString()
      : isZodType(paramSchema, z.ZodFirstPartyTypeKind.ZodNumber) ||
        isZodType(paramSchema, z.ZodFirstPartyTypeKind.ZodBoolean)
      ? JSON.stringify(validated)
      : (newValue as string);

    const defaultValue = getDefaultValue(paramSchema._def);

    if (newValue === defaultValue) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, stringified);
    }

    router.push(
      `${pathname ?? "/"}${
        newSearchParams.toString().trim() ? "?" : ""
      }${newSearchParams.toString()}`
    );
  }

  return [obj, setSearchParam] as const;
}
